<template>
  <div class="form-card glass-surface">
    <div class="form-header">
      <div class="d-flex align-center gap-3">
        <div class="form-icon-badge">
          <v-icon :icon="isEdit ? 'mdi-folder-edit' : 'mdi-folder-plus'" size="22" color="white"></v-icon>
        </div>
        <div>
          <h2 class="form-title">{{ isEdit ? 'Edit' : 'Create' }} Rosca Group</h2>
          <p class="form-sub">{{ isEdit ? 'Update the group details below' : 'Fill in the details to start a new ROSCA' }}</p>
        </div>
      </div>
    </div>

    <v-divider></v-divider>

    <v-card-text class="pa-6">
      <v-form ref="form" v-model="valid">

        <v-text-field
          v-model="formData.name"
          label="Group Name"
          :rules="[rules.required]"
          prepend-inner-icon="mdi-folder"
          class="mb-4"
          hint="e.g. Office Kameeti 2025"
          persistent-hint
        ></v-text-field>

        <v-row>
          <v-col cols="12" sm="6">
            <v-text-field
              v-model.number="formData.totalMonths"
              label="Total Months"
              type="number"
              :rules="[rules.required, rules.positive]"
              prepend-inner-icon="mdi-calendar-month"
              class="mb-4"
              hint="Duration of the ROSCA cycle"
              persistent-hint
              min="1"
            ></v-text-field>
          </v-col>
          <v-col cols="12" sm="6">
            <v-text-field
              v-model.number="formData.monthlyAmount"
              label="Monthly Amount (PKR)"
              type="number"
              :rules="[rules.required, rules.positive]"
              prepend-inner-icon="mdi-cash"
              prefix="PKR"
              class="mb-4"
              hint="Each person's monthly contribution"
              persistent-hint
              min="1"
            ></v-text-field>
          </v-col>
        </v-row>

        <v-text-field
          v-model="formData.startMonth"
          label="Start Month"
          type="month"
          :rules="[rules.required]"
          prepend-inner-icon="mdi-calendar-start"
          class="mb-4"
          hint="The first month the ROSCA begins"
          persistent-hint
        ></v-text-field>

        <v-textarea
          v-model="formData.description"
          label="Description (Optional)"
          prepend-inner-icon="mdi-text"
          rows="2"
          hint="Any notes about this group"
          persistent-hint
        ></v-textarea>

        <div v-if="formData.totalMonths && formData.monthlyAmount" class="preview-card mt-5">
          <div class="preview-label">
            <v-icon size="14" class="mr-1">mdi-eye</v-icon>
            Summary Preview
          </div>
          <div class="preview-stats">
            <div class="prev-stat">
              <div class="prev-val">{{ formData.totalMonths }}</div>
              <div class="prev-lbl">Months</div>
            </div>
            <div class="prev-divider"></div>
            <div class="prev-stat">
              <div class="prev-val">PKR {{ (formData.monthlyAmount || 0).toLocaleString() }}</div>
              <div class="prev-lbl">Per Month</div>
            </div>
            <div class="prev-divider"></div>
            <div class="prev-stat">
              <div class="prev-val highlight">PKR {{ ((formData.totalMonths || 0) * (formData.monthlyAmount || 0)).toLocaleString() }}</div>
              <div class="prev-lbl">Total Pool</div>
            </div>
          </div>
        </div>

      </v-form>
    </v-card-text>

    <div class="form-actions">
      <v-btn variant="outlined" size="large" @click="$emit('cancel')">Cancel</v-btn>
      <v-btn
        color="primary" :disabled="!valid"
        @click="handleSubmit"
        prepend-icon="mdi-content-save"
        size="large" variant="flat"
      >
        {{ isEdit ? 'Update Group' : 'Create Group' }}
      </v-btn>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, watch } from 'vue'

const props = defineProps({
  group: { type: Object, default: null }
})
const emit = defineEmits(['submit', 'cancel'])

const form   = ref(null)
const valid  = ref(false)
const isEdit = ref(!!props.group)

const formData = reactive({
  name:          props.group?.name          || '',
  totalMonths:   props.group?.totalMonths   || 10,
  monthlyAmount: props.group?.monthlyAmount || 5000,
  startMonth:    props.group?.startMonth    || '',
  description:   props.group?.description   || ''
})

const rules = {
  required: v => !!v || 'This field is required',
  positive:  v => v > 0 || 'Must be a positive number'
}

watch(() => props.group, (g) => {
  if (g) {
    Object.assign(formData, {
      name: g.name || '', totalMonths: g.totalMonths || 10,
      monthlyAmount: g.monthlyAmount || 5000,
      startMonth: g.startMonth || '', description: g.description || ''
    })
    isEdit.value = true
  }
}, { deep: true })

const handleSubmit = async () => {
  const { valid: ok } = await form.value.validate()
  if (ok) emit('submit', { ...formData })
}
</script>

<style scoped>
.form-card { overflow: hidden; }
.form-header { padding: 24px 28px 20px; }
.form-icon-badge {
  width: 46px; height: 46px; border-radius: var(--radius-sm);
  background: var(--brand-gradient);
  display: flex; align-items: center; justify-content: center;
  box-shadow: 0 4px 14px rgba(5, 150, 105, 0.35);
  flex-shrink: 0;
}
.form-title { font-size: 22px; font-weight: 800; color: var(--text-primary); margin: 0; letter-spacing: -0.02em; }
.form-sub { font-size: 13px; margin: 0; color: var(--text-muted); font-weight: 500; }

.preview-card {
  background: var(--brand-gradient-subtle);
  border: 1px solid var(--border-strong);
  border-radius: var(--radius-md);
  padding: 18px 20px;
}
.preview-label {
  font-size: 11px; font-weight: 700; color: var(--text-muted);
  text-transform: uppercase; letter-spacing: 0.06em;
  display: flex; align-items: center; margin-bottom: 14px;
}
.preview-stats { display: flex; align-items: center; }
.prev-stat { flex: 1; text-align: center; }
.prev-val { font-size: 17px; font-weight: 800; color: var(--text-primary); letter-spacing: -0.02em; }
.prev-val.highlight { background: var(--brand-gradient); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
.prev-lbl { font-size: 10px; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.05em; margin-top: 3px; font-weight: 600; }
.prev-divider { width: 1px; height: 40px; background: var(--border-default); }

.form-actions {
  display: flex; justify-content: flex-end; gap: 12px;
  padding: 16px 24px;
  background: var(--bg-muted);
  border-top: 1px solid var(--border-subtle);
}
</style>
