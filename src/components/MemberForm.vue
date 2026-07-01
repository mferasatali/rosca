<template>
  <div class="form-card glass-surface">
    <div class="form-header">
      <div class="d-flex align-center gap-3">
        <div class="form-icon-badge success">
          <v-icon :icon="isEdit ? 'mdi-account-edit' : 'mdi-account-plus'" size="22" color="white"></v-icon>
        </div>
        <div>
          <h2 class="form-title">{{ isEdit ? 'Edit' : 'Add' }} Member</h2>
          <p class="form-sub">
            {{ isEdit ? 'Update member details' : 'Add a new member to this Rosca group' }}
          </p>
        </div>
      </div>
    </div>

    <v-divider></v-divider>

    <v-card-text class="pa-6">
      <v-form ref="form" v-model="valid">

        <v-text-field
          v-model="formData.name"
          label="Member Name"
          :rules="[rules.required]"
          prepend-inner-icon="mdi-account"
          class="mb-4"
          hint="Full name of the member"
          persistent-hint
        ></v-text-field>

        <v-text-field
          v-model.number="formData.roscaCount"
          label="Number of Rosca (Slots)"
          type="number"
          :rules="[rules.required, rules.positive, rules.minOne]"
          prepend-inner-icon="mdi-numeric"
          class="mb-1"
          min="1"
        ></v-text-field>

        <div class="rosca-info-card mb-5">
          <v-icon size="16" color="primary" class="mr-1 flex-shrink-0">mdi-information-outline</v-icon>
          <span class="info-text">
            This member will <strong>receive the pot</strong> for
            <strong>{{ formData.roscaCount || 0 }}</strong>
            month{{ (formData.roscaCount || 0) !== 1 ? 's' : '' }}.
            Each month they also <strong>contribute</strong> to others' pots.
          </span>
        </div>

        <v-text-field
          v-model="formData.phone"
          label="Phone Number (Optional)"
          prepend-inner-icon="mdi-phone"
          class="mb-4"
          hint="For payment reminders"
          persistent-hint
        ></v-text-field>

        <v-textarea
          v-model="formData.notes"
          label="Notes (Optional)"
          prepend-inner-icon="mdi-note-text"
          rows="2"
        ></v-textarea>

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
        {{ isEdit ? 'Update Member' : 'Add Member' }}
      </v-btn>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, watch } from 'vue'

const props = defineProps({
  member: { type: Object, default: null }
})
const emit = defineEmits(['submit', 'cancel'])

const form   = ref(null)
const valid  = ref(false)
const isEdit = ref(!!props.member)

const formData = reactive({
  name:       props.member?.name       || '',
  roscaCount: props.member?.roscaCount || 1,
  phone:      props.member?.phone      || '',
  notes:      props.member?.notes      || ''
})

const rules = {
  required: v => !!v || 'This field is required',
  positive:  v => v > 0 || 'Must be a positive number',
  minOne:    v => v >= 1 || 'Must be at least 1'
}

watch(() => props.member, (m) => {
  if (m) {
    Object.assign(formData, {
      name: m.name || '', roscaCount: m.roscaCount || 1,
      phone: m.phone || '', notes: m.notes || ''
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
.form-icon-badge.success {
  background: linear-gradient(135deg, #10b981, #059669);
  box-shadow: 0 4px 14px rgba(16, 185, 129, 0.35);
}
.form-title { font-size: 22px; font-weight: 800; color: var(--text-primary); margin: 0; letter-spacing: -0.02em; }
.form-sub { font-size: 13px; margin: 0; color: var(--text-muted); font-weight: 500; }

.rosca-info-card {
  display: flex; align-items: flex-start; gap: 6px;
  background: var(--brand-gradient-subtle);
  border: 1px solid var(--border-strong);
  border-radius: var(--radius-sm);
  padding: 12px 16px;
}
.info-text { font-size: 13px; color: var(--text-secondary); line-height: 1.5; }

.form-actions {
  display: flex; justify-content: flex-end; gap: 12px;
  padding: 16px 24px;
  background: var(--bg-muted);
  border-top: 1px solid var(--border-subtle);
}
</style>
