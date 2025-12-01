<template>
  <div class="glass-card form-card">
    <div class="card-header-form">
      <div class="d-flex align-center">
        <div class="icon-wrapper primary">
          <v-icon icon="mdi-account-plus" size="24"></v-icon>
        </div>
        <h2 class="card-title">{{ isEdit ? 'Edit' : 'Add' }} Member</h2>
      </div>
    </div>
    
    <v-card-text class="pa-6">
      <v-form ref="form" v-model="valid">
        <v-text-field
          v-model="formData.name"
          label="Member Name"
          :rules="[rules.required]"
          prepend-inner-icon="mdi-account"
          variant="outlined"
          required
          class="mb-4"
          rounded="lg"
        ></v-text-field>

        <v-text-field
          v-model.number="formData.roscaCount"
          label="Number of Rosca"
          type="number"
          :rules="[rules.required, rules.positive, rules.minOne]"
          hint="How many months this member will receive the pot"
          prepend-inner-icon="mdi-numeric"
          variant="outlined"
          required
          class="mb-4"
          rounded="lg"
        >
          <template v-slot:hint>
            <div class="text-caption d-flex align-center">
              <v-icon icon="mdi-information" size="14" class="mr-1"></v-icon>
              How many months this member will receive the pot (Rosca count)
            </div>
          </template>
        </v-text-field>

        <v-text-field
          v-model="formData.phone"
          label="Phone Number (Optional)"
          prepend-inner-icon="mdi-phone"
          variant="outlined"
          class="mb-4"
          rounded="lg"
        ></v-text-field>

        <v-textarea
          v-model="formData.notes"
          label="Notes (Optional)"
          prepend-inner-icon="mdi-note-text"
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
        {{ isEdit ? 'Update' : 'Add' }}
      </v-btn>
    </v-card-actions>
  </div>
</template>

<script setup>
import { ref, reactive, watch } from 'vue'

const props = defineProps({
  member: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['submit', 'cancel'])

const form = ref(null)
const valid = ref(false)
const isEdit = ref(!!props.member)

const formData = reactive({
  name: props.member?.name || '',
  roscaCount: props.member?.roscaCount || 1,
  phone: props.member?.phone || '',
  notes: props.member?.notes || ''
})

const rules = {
  required: value => !!value || 'This field is required',
  positive: value => value > 0 || 'Must be a positive number',
  minOne: value => value >= 1 || 'Must be at least 1'
}

watch(() => props.member, (newMember) => {
  if (newMember) {
    Object.assign(formData, {
      name: newMember.name || '',
      roscaCount: newMember.roscaCount || 1,
      phone: newMember.phone || '',
      notes: newMember.notes || ''
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
