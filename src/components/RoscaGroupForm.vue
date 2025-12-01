<template>
  <div class="glass-card form-card">
    <div class="card-header-form">
      <div class="d-flex align-center">
        <div class="icon-wrapper primary">
          <v-icon icon="mdi-folder-plus" size="24"></v-icon>
        </div>
        <h2 class="card-title">{{ isEdit ? 'Edit' : 'Create' }} Rosca Group</h2>
      </div>
    </div>
    
    <v-card-text class="pa-6">
      <v-form ref="form" v-model="valid">
        <v-text-field
          v-model="formData.name"
          label="Group Name"
          :rules="[rules.required]"
          prepend-inner-icon="mdi-folder"
          variant="outlined"
          required
          class="mb-4"
          rounded="lg"
        ></v-text-field>

        <v-row>
          <v-col cols="12" sm="6">
            <v-text-field
              v-model.number="formData.totalMonths"
              label="Total Months"
              type="number"
              :rules="[rules.required, rules.positive]"
              prepend-inner-icon="mdi-calendar-month"
              variant="outlined"
              required
              class="mb-4"
              rounded="lg"
            ></v-text-field>
          </v-col>
          <v-col cols="12" sm="6">
            <v-text-field
              v-model.number="formData.monthlyAmount"
              label="Monthly Amount (per person)"
              type="number"
              :rules="[rules.required, rules.positive]"
              prepend-inner-icon="mdi-cash"
              prefix="PKR"
              variant="outlined"
              required
              class="mb-4"
              rounded="lg"
            ></v-text-field>
          </v-col>
        </v-row>

        <v-text-field
          v-model="formData.startMonth"
          label="Start Month"
          type="month"
          :rules="[rules.required]"
          prepend-inner-icon="mdi-calendar-start"
          variant="outlined"
          required
          class="mb-4"
          rounded="lg"
        ></v-text-field>

        <v-textarea
          v-model="formData.description"
          label="Description (Optional)"
          prepend-inner-icon="mdi-text"
          variant="outlined"
          rows="3"
          rounded="lg"
        ></v-textarea>
      </v-form>
    </v-card-text>
    
    <v-card-actions class="pa-4 form-actions">
      <v-spacer></v-spacer>
      <v-btn 
        variant="outlined" 
        size="large"
        rounded="lg"
        @click="$emit('cancel')"
      >
        Cancel
      </v-btn>
      <v-btn 
        color="primary" 
        :disabled="!valid" 
        @click="handleSubmit"
        prepend-icon="mdi-content-save"
        size="large"
        variant="flat"
        rounded="lg"
      >
        {{ isEdit ? 'Update' : 'Create' }}
      </v-btn>
    </v-card-actions>
  </div>
</template>

<script setup>
import { ref, reactive, watch } from 'vue'

const props = defineProps({
  group: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['submit', 'cancel'])

const form = ref(null)
const valid = ref(false)
const isEdit = ref(!!props.group)

const formData = reactive({
  name: props.group?.name || '',
  totalMonths: props.group?.totalMonths || 10,
  monthlyAmount: props.group?.monthlyAmount || 5000,
  startMonth: props.group?.startMonth || '',
  description: props.group?.description || ''
})

const rules = {
  required: value => !!value || 'This field is required',
  positive: value => value > 0 || 'Must be a positive number'
}

watch(() => props.group, (newGroup) => {
  if (newGroup) {
    Object.assign(formData, {
      name: newGroup.name || '',
      totalMonths: newGroup.totalMonths || 10,
      monthlyAmount: newGroup.monthlyAmount || 5000,
      startMonth: newGroup.startMonth || '',
      description: newGroup.description || ''
    })
    isEdit.value = true
  }
}, { deep: true })

const handleSubmit = async () => {
  const { valid: isValid } = await form.value.validate()
  if (isValid) {
    emit('submit', { ...formData })
  }
}
</script>

<style scoped>
.glass-card {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 20px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08), 0 0 0 1px rgba(0, 0, 0, 0.04);
  border: 1px solid rgba(0, 0, 0, 0.06);
}

:deep(.v-text-field) {
  color: #1e293b !important;
}

:deep(.v-field__input) {
  color: #1e293b !important;
}

:deep(.v-label) {
  color: #64748b !important;
}

:deep(.v-field__prepend-inner) {
  color: #0891B2 !important;
}

.card-header-form {
  padding: 24px 24px 0 24px;
  margin-bottom: 8px;
}

.card-title {
  font-size: 24px;
  font-weight: 700;
  margin: 0;
  color: #1e293b;
}

.icon-wrapper {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 12px;
}

.icon-wrapper.primary {
  background: linear-gradient(135deg, #0891B2 0%, #0D9488 100%);
  color: white;
  box-shadow: 0 2px 8px rgba(8, 145, 178, 0.2);
}

.form-actions {
  background: #f8fafc;
  border-radius: 0 0 20px 20px;
}
</style>
