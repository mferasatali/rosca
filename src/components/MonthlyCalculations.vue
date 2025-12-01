<template>
  <div class="glass-card calculations-card">
    <div class="card-header">
      <div class="d-flex align-center justify-space-between">
        <div class="d-flex align-center">
          <div class="icon-wrapper primary">
            <v-icon icon="mdi-calculator" size="24"></v-icon>
          </div>
          <h2 class="card-title">Monthly Calculations</h2>
        </div>
        <v-btn 
          color="primary" 
          prepend-icon="mdi-calculator-variant"
          @click="calculateAndSave" 
          :disabled="!canCalculate"
          variant="flat"
          size="large"
          :class="{ 'pulse': canCalculate }"
        >
          Calculate & Save
        </v-btn>
      </div>
    </div>
    
    <div class="card-content">
      <v-alert 
        v-if="!canCalculate" 
        type="warning" 
        variant="tonal"
        class="mb-4 alert-modern"
        icon="mdi-alert"
        rounded="lg"
      >
        <div class="font-weight-bold mb-1">Setup Required</div>
        Please add members to the group first. Total rosca count should match total months.
      </v-alert>

      <v-alert 
        v-if="totalRoscaCount !== groupData.totalMonths && members.length > 0" 
        type="error" 
        variant="tonal"
        class="mb-4 alert-modern"
        icon="mdi-alert-circle"
        rounded="lg"
      >
        <div class="font-weight-bold mb-1">Mismatch Detected</div>
        Total Rosca Count ({{ totalRoscaCount }}) does not match Total Months ({{ groupData.totalMonths }})
      </v-alert>

      <!-- Summary Cards -->
      <div v-if="calculations.length > 0" class="summary-cards mb-4">
        <div class="summary-card">
          <div class="summary-icon blue">
            <v-icon icon="mdi-calendar-check" size="24"></v-icon>
          </div>
          <div class="summary-content">
            <div class="summary-value">{{ totalMonthsPaid }} / {{ calculations.length }}</div>
            <div class="summary-label">Months Paid</div>
          </div>
        </div>
        <div class="summary-card">
          <div class="summary-icon green">
            <v-icon icon="mdi-cash-multiple" size="24"></v-icon>
          </div>
          <div class="summary-content">
            <div class="summary-value">PKR {{ totalAmountPaid.toLocaleString() }}</div>
            <div class="summary-label">Total Paid</div>
          </div>
        </div>
        <div class="summary-card">
          <div class="summary-icon purple">
            <v-icon icon="mdi-cash-minus" size="24"></v-icon>
          </div>
          <div class="summary-content">
            <div class="summary-value">PKR {{ totalAmountPending.toLocaleString() }}</div>
            <div class="summary-label">Pending</div>
          </div>
        </div>
      </div>

      <v-tabs v-model="tab" color="primary" class="mb-4 modern-tabs">
        <v-tab value="monthly" prepend-icon="mdi-calendar-month">
          Monthly View
        </v-tab>
        <v-tab value="summary" prepend-icon="mdi-chart-box">
          Member Summary
        </v-tab>
        <v-tab value="payments" prepend-icon="mdi-history">
          Payment History
        </v-tab>
      </v-tabs>

      <v-window v-model="tab">
        <v-window-item value="monthly">
          <div v-if="calculations.length > 0">
            <v-expansion-panels variant="accordion" class="month-panels">
              <v-expansion-panel
                v-for="(calc, index) in calculations"
                :key="index"
                :value="index"
                class="month-panel"
              >
                <v-expansion-panel-title class="month-panel-title">
                  <div class="d-flex align-center justify-space-between w-100 pr-4">
                    <div class="d-flex align-center">
                      <v-icon icon="mdi-calendar" color="primary" class="mr-3"></v-icon>
                      <div>
                        <div class="month-name-header">{{ formatMonth(calc.month) }}</div>
                        <div class="month-subtitle">
                          <v-chip 
                            :color="calc.paymentReceived ? 'success' : 'warning'" 
                            size="small" 
                            variant="flat"
                            class="mr-2"
                          >
                            <v-icon 
                              :icon="calc.paymentReceived ? 'mdi-check-circle' : 'mdi-clock-outline'" 
                              size="14"
                              class="mr-1"
                            ></v-icon>
                            {{ calc.paymentReceived ? 'Paid' : 'Pending' }}
                          </v-chip>
                          <span class="text-caption text-grey" v-if="calc.receivingMember">
                            Received by: {{ calc.receivingMember.name }}
                          </span>
                          <span class="text-caption text-grey" v-else>
                            Received by: Not selected
                          </span>
                        </div>
                      </div>
                    </div>
                    <div class="d-flex align-center gap-3">
                      <v-chip color="success" variant="flat" size="large">
                        <v-icon start icon="mdi-cash"></v-icon>
                        PKR {{ calc.members.filter(m => m.amountGivenStatus).reduce((sum, m) => sum + m.amountGiven, 0).toLocaleString() }}
                      </v-chip>
                      <v-btn
                        :color="calc.paymentReceived ? 'success' : 'warning'"
                        :variant="calc.paymentReceived ? 'flat' : 'outlined'"
                        size="small"
                        @click.stop="togglePaymentStatus(index)"
                        :prepend-icon="calc.paymentReceived ? 'mdi-check-circle' : 'mdi-clock-outline'"
                      >
                        {{ calc.paymentReceived ? 'Paid' : 'Mark as Paid' }}
                      </v-btn>
                    </div>
                  </div>
                </v-expansion-panel-title>
                
                <v-expansion-panel-text>
                  <div class="month-details">
                    <div class="receiving-member-card">
                      <div class="d-flex align-center">
                        <div class="receiving-icon">
                          <v-icon icon="mdi-account-check" color="success" size="28"></v-icon>
                        </div>
                        <div class="receiving-info">
                          <div class="receiving-label">Receiving Member</div>
                          <div class="receiving-name" v-if="calc.receivingMember">
                            {{ calc.receivingMember.name }}
                          </div>
                          <div class="receiving-name text-grey" v-else>
                            Not selected yet
                          </div>
                        </div>
                        <v-select
                          :model-value="calc.receivingMemberId"
                          :items="members"
                          item-title="name"
                          item-value="id"
                          label="Select Member"
                          variant="outlined"
                          density="compact"
                          hide-details
                          class="receiving-member-select"
                          @update:model-value="(value) => updateReceivingMember(index, value)"
                          prepend-inner-icon="mdi-account-circle"
                        ></v-select>
                      </div>
                    </div>
                    
                    <div class="month-totals mb-4">
                      <div class="total-row">
                        <span class="total-label">Total Expected:</span>
                        <span class="total-value">PKR {{ calc.totalPot.toLocaleString() }}</span>
                      </div>
                      <div class="total-row">
                        <span class="total-label">Members Given:</span>
                        <span class="total-value">
                          {{ calc.members.filter(m => m.amountGivenStatus).length }} / {{ calc.members.length }}
                        </span>
                      </div>
                      <div class="total-row">
                        <span class="total-label">Total Given (All Members):</span>
                        <span class="total-value">PKR {{ calc.members.reduce((sum, m) => sum + m.amountGiven, 0).toLocaleString() }}</span>
                      </div>
                    </div>
                    
                    <div class="members-table-modern">
                      <div class="table-header">
                        <div class="table-col">Member</div>
                        <div class="table-col center">Rosca</div>
                        <div class="table-col center">Given Status</div>
                        <div class="table-col right">Amount Given</div>
                        <div class="table-col right">Amount Received</div>
                      </div>
                      <div
                        v-for="member in calc.members"
                        :key="member.memberId"
                        class="table-row"
                        :class="{ 'receiving': member.amountReceived > 0 }"
                      >
                        <div class="table-col">
                          <div class="d-flex align-center">
                            <v-icon 
                              v-if="member.amountReceived > 0" 
                              icon="mdi-star" 
                              color="success" 
                              size="16" 
                              class="mr-2"
                            ></v-icon>
                            <span class="member-name-cell">{{ member.memberName }}</span>
                          </div>
                        </div>
                        <div class="table-col center">
                          <v-chip size="small" color="primary" variant="flat">
                            {{ member.roscaCount }}
                          </v-chip>
                        </div>
                        <div class="table-col center">
                          <v-btn
                            :color="member.amountGivenStatus ? 'success' : 'warning'"
                            :variant="member.amountGivenStatus ? 'flat' : 'outlined'"
                            size="small"
                            @click="toggleGivenStatus(index, member.memberId)"
                            :prepend-icon="member.amountGivenStatus ? 'mdi-check-circle' : 'mdi-close-circle'"
                          >
                            {{ member.amountGivenStatus ? 'Given' : 'Not Given' }}
                          </v-btn>
                        </div>
                        <div class="table-col right">
                          <span class="amount-text">PKR {{ member.amountGiven.toLocaleString() }}</span>
                        </div>
                        <div class="table-col right">
                          <span 
                            :class="member.amountReceived > 0 ? 'amount-received' : 'amount-text'"
                          >
                            {{ member.amountReceived > 0 ? '+' : '' }}PKR {{ member.amountReceived.toLocaleString() }}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </v-expansion-panel-text>
              </v-expansion-panel>
            </v-expansion-panels>
          </div>
          
          <div v-else class="empty-state">
            <div class="empty-icon">
              <v-icon icon="mdi-calculator-variant-outline" size="64"></v-icon>
            </div>
            <h3 class="empty-title">No calculations available</h3>
            <p class="empty-text">Click "Calculate & Save" to generate calculations</p>
          </div>
        </v-window-item>

        <v-window-item value="summary">
          <div v-if="calculations.length > 0" class="summary-table-modern">
            <div class="table-header">
              <div class="table-col">Member</div>
              <div class="table-col right">Total Given</div>
              <div class="table-col right">Total Received</div>
              <div class="table-col center">Months</div>
            </div>
            <div
              v-for="member in members"
              :key="member.id || member.name"
              class="table-row summary-row"
            >
              <div class="table-col">
                <div class="d-flex align-center">
                  <v-avatar color="primary" size="32" class="mr-2">
                    {{ member.name.charAt(0).toUpperCase() }}
                  </v-avatar>
                  <span class="member-name-cell">{{ member.name }}</span>
                </div>
              </div>
              <div class="table-col right">
                <span class="amount-text">PKR {{ getMemberSummary(member).totalGiven.toLocaleString() }}</span>
              </div>
              <div class="table-col right">
                <span class="amount-received">PKR {{ getMemberSummary(member).totalReceived.toLocaleString() }}</span>
              </div>
              <div class="table-col center">
                <v-chip size="small" color="info" variant="flat">
                  {{ getMemberSummary(member).monthsParticipated }}
                </v-chip>
              </div>
            </div>
          </div>
          
          <div v-else class="empty-state">
            <div class="empty-icon">
              <v-icon icon="mdi-chart-box-outline" size="64"></v-icon>
            </div>
            <h3 class="empty-title">No calculations available</h3>
            <p class="empty-text">Click "Calculate & Save" to generate calculations</p>
          </div>
        </v-window-item>

        <v-window-item value="payments">
          <div v-if="calculations.length > 0" class="payment-history">
            <h3 class="section-title mb-4">Payment History</h3>
            <div class="payment-list">
              <div
                v-for="(calc, index) in calculations"
                :key="index"
                class="payment-item"
                :class="{ 'paid': calc.paymentReceived, 'pending': !calc.paymentReceived }"
              >
                <div class="payment-month">
                  <v-icon 
                    :icon="calc.paymentReceived ? 'mdi-check-circle' : 'mdi-clock-outline'" 
                    :color="calc.paymentReceived ? 'success' : 'warning'"
                    size="24"
                    class="mr-3"
                  ></v-icon>
                  <div>
                    <div class="payment-month-name">{{ formatMonth(calc.month) }}</div>
                    <div class="payment-date" v-if="calc.paymentDate">
                      Paid on: {{ formatDate(calc.paymentDate) }}
                    </div>
                  </div>
                </div>
                <div class="payment-details">
                  <div class="payment-recipient">
                    <v-icon icon="mdi-account" size="16" class="mr-1"></v-icon>
                    {{ calc.receivingMember?.name }}
                  </div>
                  <div class="payment-amount">
                    PKR {{ calc.totalPot.toLocaleString() }}
                  </div>
                </div>
                <div class="payment-status">
                  <v-chip 
                    :color="calc.paymentReceived ? 'success' : 'warning'" 
                    variant="flat"
                    size="small"
                  >
                    {{ calc.paymentReceived ? 'Paid' : 'Pending' }}
                  </v-chip>
                </div>
              </div>
            </div>
            
            <div class="payment-summary mt-6">
              <h4 class="summary-title mb-3">Payment Summary</h4>
              <div class="summary-stats">
                <div class="stat-item">
                  <div class="stat-label">Total Payments Made</div>
                  <div class="stat-value success">PKR {{ totalAmountPaid.toLocaleString() }}</div>
                </div>
                <div class="stat-item">
                  <div class="stat-label">Pending Payments</div>
                  <div class="stat-value warning">PKR {{ totalAmountPending.toLocaleString() }}</div>
                </div>
                <div class="stat-item">
                  <div class="stat-label">Total Amount</div>
                  <div class="stat-value">PKR {{ (totalAmountPaid + totalAmountPending).toLocaleString() }}</div>
                </div>
              </div>
            </div>
          </div>
          
          <div v-else class="empty-state">
            <div class="empty-icon">
              <v-icon icon="mdi-history" size="64"></v-icon>
            </div>
            <h3 class="empty-title">No payment history</h3>
            <p class="empty-text">Generate calculations to see payment history</p>
          </div>
        </v-window-item>
      </v-window>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { calculateMonthlyDistributions, calculateMemberSummary } from '../utils/roscaCalculator'
import { saveMonthlyCalculations, getMonthlyCalculations, updateMonthPaymentStatus } from '../services/roscaService'

const props = defineProps({
  groupData: {
    type: Object,
    required: true
  },
  members: {
    type: Array,
    default: () => []
  },
  groupId: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['saved', 'error'])

const tab = ref('monthly')
const calculations = ref([])

const totalRoscaCount = computed(() => {
  return props.members.reduce((sum, member) => sum + (member.roscaCount || 0), 0)
})

const canCalculate = computed(() => {
  return props.members.length > 0 && totalRoscaCount.value === props.groupData.totalMonths
})

const totalMonthsPaid = computed(() => {
  return calculations.value.filter(calc => calc.paymentReceived).length
})

const totalAmountPaid = computed(() => {
  return calculations.value
    .filter(calc => calc.paymentReceived)
    .reduce((sum, calc) => sum + calc.totalPot, 0)
})

const totalAmountPending = computed(() => {
  return calculations.value
    .filter(calc => !calc.paymentReceived)
    .reduce((sum, calc) => sum + calc.totalPot, 0)
})

const getMemberSummary = (member) => {
  if (calculations.value.length === 0) {
    return { totalGiven: 0, totalReceived: 0, netAmount: 0, monthsParticipated: 0 }
  }
  const memberId = member.id || props.members.indexOf(member)
  return calculateMemberSummary(calculations.value, memberId)
}

const formatMonth = (monthString) => {
  if (!monthString) return '-'
  const [year, month] = monthString.split('-')
  const date = new Date(year, parseInt(month) - 1)
  return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
}

const formatDate = (date) => {
  if (!date) return '-'
  const d = date.toDate ? date.toDate() : new Date(date)
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

const togglePaymentStatus = async (monthIndex) => {
  if (!props.groupId || !calculations.value[monthIndex]) return
  
  const newStatus = !calculations.value[monthIndex].paymentReceived
  
  try {
    // Update locally first for immediate feedback
    calculations.value[monthIndex].paymentReceived = newStatus
    calculations.value[monthIndex].paymentDate = newStatus ? new Date() : null
    
    // Save to Firebase
    await saveCalculationsToFirebase()
    emit('saved')
  } catch (error) {
    console.error('Error updating payment status:', error)
    emit('error', error.message)
    // Revert the change on error
    calculations.value[monthIndex].paymentReceived = !newStatus
    calculations.value[monthIndex].paymentDate = null
  }
}

const toggleGivenStatus = async (monthIndex, memberId) => {
  if (!props.groupId || !calculations.value[monthIndex]) return
  
  const member = calculations.value[monthIndex].members.find(m => m.memberId === memberId)
  if (!member) return
  
  const newStatus = !member.amountGivenStatus
  
  try {
    // Update locally first
    member.amountGivenStatus = newStatus
    member.amountGivenDate = newStatus ? new Date() : null
    
    // Save to Firebase
    await saveCalculationsToFirebase()
    emit('saved')
  } catch (error) {
    console.error('Error updating given status:', error)
    emit('error', error.message)
    // Revert the change on error
    member.amountGivenStatus = !newStatus
    member.amountGivenDate = null
  }
}

const updateReceivingMember = async (monthIndex, memberId) => {
  if (!props.groupId || !calculations.value[monthIndex]) return
  
  const calc = calculations.value[monthIndex]
  const selectedMember = props.members.find(m => m.id === memberId)
  
  if (!selectedMember) return
  
  try {
    // Update locally first
    const oldReceivingMemberId = calc.receivingMemberId
    calc.receivingMemberId = memberId
    calc.receivingMember = selectedMember
    
    // Reset all members' received amounts
    calc.members.forEach(m => {
      m.amountReceived = 0
    })
    
    // Set the receiving member's amount
    const receivingMember = calc.members.find(m => m.memberId === memberId)
    if (receivingMember) {
      receivingMember.amountReceived = calc.totalPot
    }
    
    // Save to Firebase
    await saveCalculationsToFirebase()
    emit('saved')
  } catch (error) {
    console.error('Error updating receiving member:', error)
    emit('error', error.message)
    // Reload from Firebase on error
    await loadSavedCalculations()
  }
}

const saveCalculationsToFirebase = async () => {
  if (!props.groupId) return
  
  try {
    await saveMonthlyCalculations(props.groupId, calculations.value)
  } catch (error) {
    console.error('Error saving calculations:', error)
    throw error
  }
}

const calculateAndSave = async () => {
  if (!canCalculate.value) {
    return
  }

  try {
    const newCalculations = calculateMonthlyDistributions(props.groupData, props.members)
    
    // Preserve payment status, given status, and receiving member if recalculating
    newCalculations.forEach((calc, index) => {
      if (calculations.value[index]) {
        const oldCalc = calculations.value[index]
        calc.paymentReceived = oldCalc.paymentReceived || false
        calc.paymentDate = oldCalc.paymentDate || null
        calc.receivingMemberId = oldCalc.receivingMemberId || null
        calc.receivingMember = oldCalc.receivingMember || null
        
        // Preserve given status for each member
        calc.members.forEach(member => {
          const oldMember = oldCalc.members.find(m => m.memberId === member.memberId)
          if (oldMember) {
            member.amountGivenStatus = oldMember.amountGivenStatus || false
            member.amountGivenDate = oldMember.amountGivenDate || null
            member.amountReceived = oldMember.amountReceived || 0
          } else {
            member.amountGivenStatus = false
            member.amountGivenDate = null
            member.amountReceived = 0
          }
        })
        
        // Update amounts if receiving member was set
        if (calc.receivingMemberId) {
          const totalPot = calc.totalPot
          calc.members.forEach(member => {
            const isReceiving = member.memberId === calc.receivingMemberId
            member.amountReceived = isReceiving ? totalPot : 0
          })
        }
      } else {
        calc.paymentReceived = false
        calc.paymentDate = null
        calc.receivingMemberId = null
        calc.receivingMember = null
        calc.members.forEach(member => {
          member.amountGivenStatus = false
          member.amountGivenDate = null
          member.amountReceived = 0
        })
      }
    })
    
    calculations.value = newCalculations
    
    if (props.groupId) {
      await saveCalculationsToFirebase()
      emit('saved')
    }
  } catch (error) {
    console.error('Error calculating:', error)
    emit('error', error.message)
  }
}

const loadSavedCalculations = async () => {
  if (!props.groupId) return
  
  try {
    const saved = await getMonthlyCalculations(props.groupId)
    if (saved.length > 0) {
      const latest = saved[0]
      if (latest.calculations) {
        calculations.value = latest.calculations
      }
    }
  } catch (error) {
    console.error('Error loading saved calculations:', error)
  }
}

// Remove auto-recalculation - only calculate when button is clicked
onMounted(() => {
  loadSavedCalculations()
})

watch(() => props.groupId, () => {
  if (props.groupId) {
    loadSavedCalculations()
  }
})
</script>

<style scoped>
.glass-card {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 20px;
  padding: 32px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08), 0 0 0 1px rgba(0, 0, 0, 0.04);
  border: 1px solid rgba(0, 0, 0, 0.06);
}

.card-header {
  margin-bottom: 24px;
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
}

.alert-modern {
  border-radius: 16px;
  border: none;
}

.modern-tabs {
  border-radius: 12px;
}

.pulse {
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% {
    box-shadow: 0 4px 12px rgba(8, 145, 178, 0.3);
  }
  50% {
    box-shadow: 0 4px 20px rgba(8, 145, 178, 0.5);
  }
}

.summary-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
}

.summary-card {
  background: white;
  border-radius: 16px;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  border: 1px solid rgba(0, 0, 0, 0.05);
}

.summary-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.summary-icon.blue {
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
}

.summary-icon.green {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
}

.summary-icon.purple {
  background: linear-gradient(135deg, #0891B2 0%, #0D9488 100%);
}

.summary-value {
  font-size: 20px;
  font-weight: 800;
  color: #1e293b;
  margin-bottom: 4px;
}

.summary-label {
  font-size: 12px;
  color: #64748b;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.month-panels {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.month-panel {
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  border: 1px solid rgba(0, 0, 0, 0.05);
}

.month-panel-title {
  padding: 20px 24px;
}

.month-name-header {
  font-size: 18px;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 4px;
}

.month-subtitle {
  display: flex;
  align-items: center;
  gap: 8px;
}

.payment-switch {
  margin: 0;
}

.month-details {
  padding: 20px 0;
}

.receiving-member-card {
  background: linear-gradient(135deg, #10b98115 0%, #05966915 100%);
  border-radius: 16px;
  padding: 20px;
  margin-bottom: 20px;
  border: 2px solid #10b98130;
}

.receiving-member-card .d-flex {
  align-items: center;
  gap: 0;
}

.receiving-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 16px;
  flex-shrink: 0;
}

.receiving-info {
  flex: 1;
  min-width: 0;
}

.receiving-member-select {
  flex-shrink: 0;
  min-width: 200px;
}

.receiving-label {
  font-size: 12px;
  color: #64748b;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.receiving-name {
  font-size: 18px;
  font-weight: 700;
  color: #1e293b;
  margin-top: 4px;
}

.month-totals {
  background: #f8fafc;
  border-radius: 12px;
  padding: 16px;
  border-left: 4px solid #0891B2;
}

.total-row {
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
  font-size: 14px;
}

.total-row.highlight {
  border-top: 2px solid #e2e8f0;
  margin-top: 8px;
  padding-top: 12px;
  font-weight: 700;
}

.total-label {
  color: #64748b;
}

.total-value {
  color: #1e293b;
  font-weight: 600;
}

.total-value.success {
  color: #10b981;
  font-size: 16px;
}

.members-table-modern {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.table-header {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr 1fr;
  gap: 16px;
  padding: 12px 16px;
  background: #f8fafc;
  border-radius: 12px;
  font-weight: 700;
  font-size: 14px;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.table-row {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr 1fr;
  gap: 16px;
  padding: 16px;
  border-radius: 12px;
  transition: all 0.2s ease;
  align-items: center;
}

.summary-table-modern .table-header {
  grid-template-columns: 2fr 1fr 1fr 1fr;
}

.summary-table-modern .table-row {
  grid-template-columns: 2fr 1fr 1fr 1fr;
}

.table-row:hover {
  background: #f8fafc;
}

.table-row.receiving {
  background: linear-gradient(135deg, #10b98108 0%, #05966908 100%);
  border-left: 3px solid #10b981;
}

.table-col {
  font-size: 14px;
}

.table-col.center {
  text-align: center;
}

.table-col.right {
  text-align: right;
}

.member-name-cell {
  font-weight: 600;
  color: #1e293b;
}

.amount-text {
  color: #64748b;
}

.amount-received {
  color: #10b981;
  font-weight: 700;
}

.summary-table-modern {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.summary-row {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.summary-row:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
}

.payment-history {
  padding: 8px 0;
}

.section-title {
  font-size: 20px;
  font-weight: 700;
  color: #1e293b;
}

.payment-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.payment-item {
  background: white;
  border-radius: 16px;
  padding: 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  border-left: 4px solid #e2e8f0;
  transition: all 0.3s ease;
}

.payment-item.paid {
  border-left-color: #10b981;
  background: linear-gradient(135deg, #10b98108 0%, #05966908 100%);
}

.payment-item.pending {
  border-left-color: #f59e0b;
  background: linear-gradient(135deg, #f59e0b08 0%, #d9770608 100%);
}

.payment-item:hover {
  transform: translateX(4px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
}

.payment-month {
  display: flex;
  align-items: center;
  flex: 1;
}

.payment-month-name {
  font-size: 16px;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 4px;
}

.payment-date {
  font-size: 12px;
  color: #64748b;
}

.payment-details {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 4px;
  margin-right: 16px;
}

.payment-recipient {
  font-size: 14px;
  color: #64748b;
  display: flex;
  align-items: center;
}

.payment-amount {
  font-size: 18px;
  font-weight: 700;
  color: #1e293b;
}

.payment-summary {
  background: #f8fafc;
  border-radius: 16px;
  padding: 24px;
  border: 2px solid #e2e8f0;
}

.summary-title {
  font-size: 18px;
  font-weight: 700;
  color: #1e293b;
}

.summary-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
}

.stat-item {
  text-align: center;
  padding: 16px;
  background: white;
  border-radius: 12px;
}

.stat-label {
  font-size: 12px;
  color: #64748b;
  margin-bottom: 8px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.stat-value {
  font-size: 24px;
  font-weight: 800;
  color: #1e293b;
}

.stat-value.success {
  color: #10b981;
}

.stat-value.warning {
  color: #f59e0b;
}

.empty-state {
  text-align: center;
  padding: 48px 24px;
}

.empty-icon {
  margin-bottom: 16px;
  opacity: 0.5;
}

.empty-title {
  font-size: 20px;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 8px;
}

.empty-text {
  font-size: 14px;
  color: #64748b;
}

.gap-3 {
  gap: 12px;
}
</style>
