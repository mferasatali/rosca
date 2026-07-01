<template>
  <div class="calculations-wrapper">

    <!-- ── Header Card ─────────────────────────────────── -->
    <div class="calc-header section-card mb-4">
      <div class="d-flex align-center justify-space-between flex-wrap gap-3">
        <div class="d-flex align-center gap-3">
          <div class="icon-badge">
            <v-icon icon="mdi-calculator" size="22" color="white"></v-icon>
          </div>
          <div>
            <h2 class="section-heading">Monthly Calculations</h2>
            <p class="section-sub text-grey" v-if="calculations.length > 0">
              {{ totalMonthsPaid }} of {{ calculations.length }} months completed &bull;
              {{ assignedMonths }} assigned
            </p>
          </div>
        </div>
        <v-btn
          color="primary"
          prepend-icon="mdi-calculator-variant"
          @click="calculateAndSave"
          :disabled="!canCalculate"
          variant="flat"
          rounded="lg"
          size="large"
          :class="{ 'pulse-glow': canCalculate && calculations.length === 0 }"
        >
          {{ calculations.length > 0 ? 'Recalculate' : 'Calculate & Save' }}
        </v-btn>
      </div>
    </div>

    <!-- ── Alerts ──────────────────────────────────────── -->
    <v-alert
      v-if="!canCalculate"
      type="warning" variant="tonal" rounded="lg"
      class="mb-3" icon="mdi-alert" density="compact"
    >
      <strong>Setup Required:</strong> Add members so total rosca count equals total months.
    </v-alert>
    <v-alert
      v-if="totalRoscaCount !== groupData.totalMonths && members.length > 0"
      type="error" variant="tonal" rounded="lg"
      class="mb-3" icon="mdi-alert-circle" density="compact"
    >
      Total rosca count <strong>({{ totalRoscaCount }})</strong> doesn't match total months
      <strong>({{ groupData.totalMonths }})</strong>. Please adjust member rosca counts.
    </v-alert>

    <!-- ── Stats Pills ─────────────────────────────────── -->
    <div v-if="calculations.length > 0" class="stats-pills mb-4">
      <div class="stat-pill green-pill">
        <v-icon icon="mdi-check-circle" size="16"></v-icon>
        <strong>{{ totalMonthsPaid }}</strong> Paid
      </div>
      <div class="stat-pill amber-pill">
        <v-icon icon="mdi-clock-outline" size="16"></v-icon>
        <strong>{{ calculations.length - totalMonthsPaid }}</strong> Pending
      </div>
      <div class="stat-pill blue-pill">
        <v-icon icon="mdi-account-check" size="16"></v-icon>
        <strong>{{ assignedMonths }}</strong> Assigned
      </div>
      <div class="stat-pill teal-pill">
        <v-icon icon="mdi-cash-multiple" size="16"></v-icon>
        <strong>PKR {{ totalAmountPaid.toLocaleString() }}</strong> Collected
      </div>
    </div>

    <!-- ── Month Timeline ──────────────────────────────── -->
    <div v-if="calculations.length > 0" class="timeline-card section-card mb-4">
      <div class="d-flex align-center justify-space-between mb-3">
        <span class="timeline-label">Month Progress</span>
        <div class="d-flex gap-3">
          <span class="legend-item">
            <span class="leg-dot paid-dot"></span> Paid
          </span>
          <span class="legend-item">
            <span class="leg-dot assigned-dot"></span> Assigned
          </span>
          <span class="legend-item">
            <span class="leg-dot pending-dot"></span> Pending
          </span>
        </div>
      </div>
      <div class="timeline-track">
        <template v-for="(calc, i) in calculations" :key="i">
          <div
            class="timeline-dot"
            :class="getTimelineClass(calc)"
            @click="openPanelIndex = i; tab = 'monthly'"
            :title="`${formatMonth(calc.month)} — ${getStatusLabel(calc)}`"
          >
            <span class="dot-num">{{ i + 1 }}</span>
          </div>
          <div v-if="i < calculations.length - 1" class="dot-line"></div>
        </template>
      </div>
    </div>

    <!-- ── Tabs + Content ─────────────────────────────── -->
    <div v-if="calculations.length > 0" class="section-card">
      <v-tabs v-model="tab" color="primary" class="calc-tabs mb-5" density="comfortable" slider-color="primary">
        <v-tab value="monthly" prepend-icon="mdi-calendar-month">Monthly View</v-tab>
        <v-tab value="summary" prepend-icon="mdi-chart-bar">Member Summary</v-tab>
        <v-tab value="payments" prepend-icon="mdi-history">Payment History</v-tab>
      </v-tabs>

      <v-window v-model="tab">

        <!-- ═══ Monthly View Tab ═══════════════════════ -->
        <v-window-item value="monthly">
          <v-expansion-panels
            v-model="openPanelIndex"
            variant="accordion"
            class="month-panels"
          >
            <v-expansion-panel
              v-for="(calc, index) in calculations"
              :key="index"
              :value="index"
              class="month-panel"
              :class="getMonthPanelClass(calc)"
            >
              <!-- Panel Header -->
              <v-expansion-panel-title class="panel-title-custom" :hide-actions="false">
                <div class="panel-header-grid w-100 pr-2">
                  <!-- Left: Month Info -->
                  <div class="d-flex align-center gap-3">
                    <div class="month-badge" :class="getMonthBadgeClass(calc)">{{ index + 1 }}</div>
                    <div>
                      <div class="month-name-text">{{ formatMonth(calc.month) }}</div>
                      <div class="d-flex align-center gap-2 mt-1">
                        <v-chip
                          :color="calc.paymentReceived ? 'success' : calc.receivingMemberId ? 'primary' : 'warning'"
                          size="x-small" variant="flat"
                        >
                          {{ getStatusLabel(calc) }}
                        </v-chip>
                        <span v-if="calc.receivingMember" class="receiver-label">
                          <v-icon size="11" class="mr-1">mdi-account-arrow-left</v-icon>
                          {{ calc.receivingMember.name }}
                        </span>
                      </div>
                    </div>
                  </div>
                  <!-- Right: Amount + Action -->
                  <div class="d-flex align-center gap-3" @click.stop>
                    <div class="text-right">
                      <div class="pot-text">PKR {{ calc.totalPot.toLocaleString() }}</div>
                      <div class="text-caption text-grey">
                        {{ calc.members.filter(m => m.amountGivenStatus).length }}/{{ calc.members.length }} paid in
                      </div>
                    </div>
                    <v-btn
                      :color="calc.paymentReceived ? 'success' : 'warning'"
                      :variant="calc.paymentReceived ? 'flat' : 'outlined'"
                      size="small" rounded="lg"
                      @click="togglePaymentStatus(index)"
                      :prepend-icon="calc.paymentReceived ? 'mdi-check-circle' : 'mdi-clock-outline'"
                    >
                      {{ calc.paymentReceived ? 'Paid' : 'Mark Paid' }}
                    </v-btn>
                  </div>
                </div>
              </v-expansion-panel-title>

              <!-- Panel Body -->
              <v-expansion-panel-text>
                <div class="panel-body">

                  <!-- Assignment Card -->
                  <div class="assignment-card">
                    <div class="assignment-card-title">
                      <v-icon icon="mdi-account-cash" color="success" size="18"></v-icon>
                      <span>Who Receives This Month?</span>
                      <v-spacer></v-spacer>
                      <v-chip v-if="calc.receivingMember" color="success" size="x-small" variant="tonal">
                        Pot: PKR {{ calc.totalPot.toLocaleString() }}
                      </v-chip>
                    </div>
                    <div class="assignment-card-body">
                      <v-avatar :color="calc.receivingMember ? 'success' : 'grey-lighten-2'" size="52" class="flex-shrink-0">
                        <span v-if="calc.receivingMember" class="text-white font-weight-bold">
                          {{ calc.receivingMember.name?.charAt(0).toUpperCase() }}
                        </span>
                        <v-icon v-else icon="mdi-account-question" color="grey"></v-icon>
                      </v-avatar>
                      <div class="flex-grow-1">
                        <v-select
                          :model-value="calc.receivingMemberId"
                          :items="getAvailableMembers(index)"
                          item-title="displayTitle"
                          item-value="id"
                          :item-props="item => ({ disabled: item.isDisabled })"
                          label="Select receiving member"
                          variant="outlined"
                          density="compact"
                          hide-details
                          clearable
                          prepend-inner-icon="mdi-account-circle"
                          @update:model-value="(val) => updateReceivingMember(index, val)"
                        >
                          <template #item="{ item, props: itemProps }">
                            <v-list-item v-bind="itemProps">
                              <template #prepend>
                                <v-avatar
                                  :color="item.raw.isDisabled ? 'grey-lighten-3' : 'primary'"
                                  size="30"
                                  class="mr-2"
                                >
                                  <span style="font-size:11px; color:white;">{{ item.raw.name?.charAt(0) }}</span>
                                </v-avatar>
                              </template>
                              <template #append v-if="item.raw.isDisabled">
                                <v-chip color="error" size="x-small" variant="tonal">Full</v-chip>
                              </template>
                            </v-list-item>
                          </template>
                        </v-select>
                        <div v-if="hasDisabledMembers(index)" class="hint-bar mt-2">
                          <v-icon size="13" color="warning" class="mr-1">mdi-information-outline</v-icon>
                          <span class="text-caption text-medium-emphasis">
                            "Full" members have used all their rosca slots. Clear their assignment from another month to free a slot.
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- Totals Row -->
                  <div class="totals-row">
                    <div class="total-chip-card">
                      <div class="tc-label">Total Pot</div>
                      <div class="tc-value">PKR {{ calc.totalPot.toLocaleString() }}</div>
                    </div>
                    <div class="total-chip-card">
                      <div class="tc-label">Paid In</div>
                      <div class="tc-value">
                        {{ calc.members.filter(m => m.amountGivenStatus).length }} /
                        {{ calc.members.length }}
                      </div>
                    </div>
                    <div class="total-chip-card">
                      <div class="tc-label">Collected</div>
                      <div class="tc-value success-val">
                        PKR {{ calc.members.filter(m => m.amountGivenStatus).reduce((s, m) => s + m.amountGiven, 0).toLocaleString() }}
                      </div>
                    </div>
                  </div>

                  <!-- Members Grid -->
                  <div class="members-table">
                    <div class="mt-header">
                      <div>Member</div>
                      <div class="tc">Rosca</div>
                      <div class="tc">Status</div>
                      <div class="tr">Given</div>
                      <div class="tr">Received</div>
                    </div>
                    <div
                      v-for="member in calc.members"
                      :key="member.memberId"
                      class="mt-row"
                      :class="{ 'mt-row-receiver': member.amountReceived > 0 }"
                    >
                      <div class="d-flex align-center gap-2">
                        <v-avatar :color="member.amountReceived > 0 ? 'success' : 'primary'" size="30">
                          <span style="font-size:11px; color:white; font-weight:700;">{{ member.memberName?.charAt(0) }}</span>
                        </v-avatar>
                        <div>
                          <div class="mt-name">{{ member.memberName }}</div>
                          <v-chip v-if="member.amountReceived > 0" color="success" size="x-small" variant="flat" class="mt-1">Receiver</v-chip>
                        </div>
                      </div>
                      <div class="tc">
                        <v-chip size="x-small" color="primary" variant="tonal">{{ member.roscaCount }}</v-chip>
                      </div>
                      <div class="tc">
                        <v-btn
                          :color="member.amountGivenStatus ? 'success' : 'default'"
                          :variant="member.amountGivenStatus ? 'flat' : 'outlined'"
                          size="x-small" rounded="lg"
                          @click="toggleGivenStatus(index, member.memberId)"
                          :prepend-icon="member.amountGivenStatus ? 'mdi-check' : 'mdi-cash'"
                        >
                          {{ member.amountGivenStatus ? 'Paid' : 'Not Paid' }}
                        </v-btn>
                      </div>
                      <div class="tr mt-amount-grey">PKR {{ member.amountGiven.toLocaleString() }}</div>
                      <div class="tr" :class="member.amountReceived > 0 ? 'mt-amount-green' : 'mt-amount-grey'">
                        {{ member.amountReceived > 0 ? '+' : '' }}PKR {{ member.amountReceived.toLocaleString() }}
                      </div>
                    </div>
                  </div>

                </div>
              </v-expansion-panel-text>
            </v-expansion-panel>
          </v-expansion-panels>
        </v-window-item>

        <!-- ═══ Member Summary Tab ═════════════════════ -->
        <v-window-item value="summary">
          <div class="summary-grid">
            <div v-for="member in members" :key="member.id || member.name" class="summary-card">
              <v-avatar color="primary" size="52" class="mb-3">
                <span class="text-white text-h6 font-weight-bold">{{ member.name.charAt(0).toUpperCase() }}</span>
              </v-avatar>
              <div class="sc-name">{{ member.name }}</div>
              <div class="mb-2">
                <v-chip color="primary" size="x-small" variant="tonal">{{ member.roscaCount }} Rosca</v-chip>
              </div>
              <div class="sc-stats">
                <div class="sc-stat">
                  <div class="sc-stat-val text-error">PKR {{ getMemberSummary(member).totalGiven.toLocaleString() }}</div>
                  <div class="sc-stat-label">Total Given</div>
                </div>
                <div class="sc-divider"></div>
                <div class="sc-stat">
                  <div class="sc-stat-val text-success">PKR {{ getMemberSummary(member).totalReceived.toLocaleString() }}</div>
                  <div class="sc-stat-label">Total Received</div>
                </div>
                <div class="sc-divider"></div>
                <div class="sc-stat">
                  <div class="sc-stat-val">{{ getMemberSummary(member).monthsParticipated }}</div>
                  <div class="sc-stat-label">Months</div>
                </div>
              </div>
              <div class="sc-net" :class="getMemberSummary(member).totalReceived >= getMemberSummary(member).totalGiven ? 'net-positive' : 'net-negative'">
                Net: {{ getMemberSummary(member).totalReceived >= getMemberSummary(member).totalGiven ? '+' : '' }}PKR
                {{ (getMemberSummary(member).totalReceived - getMemberSummary(member).totalGiven).toLocaleString() }}
              </div>
            </div>
          </div>
        </v-window-item>

        <!-- ═══ Payment History Tab ════════════════════ -->
        <v-window-item value="payments">
          <div class="payment-list">
            <div
              v-for="(calc, index) in calculations"
              :key="index"
              class="payment-item"
              :class="calc.paymentReceived ? 'pi-paid' : 'pi-pending'"
            >
              <div class="pi-left">
                <v-icon
                  :icon="calc.paymentReceived ? 'mdi-check-circle' : 'mdi-clock-outline'"
                  :color="calc.paymentReceived ? 'success' : 'warning'"
                  size="26"
                ></v-icon>
                <div class="ml-3">
                  <div class="pi-month">{{ formatMonth(calc.month) }}</div>
                  <div class="pi-recipient text-grey">
                    <v-icon size="12" class="mr-1">mdi-account</v-icon>
                    {{ calc.receivingMember?.name || 'Not assigned' }}
                  </div>
                  <div class="text-caption text-grey" v-if="calc.paymentDate">{{ formatDate(calc.paymentDate) }}</div>
                </div>
              </div>
              <div class="pi-right">
                <div class="pi-amount">PKR {{ calc.totalPot.toLocaleString() }}</div>
                <v-chip :color="calc.paymentReceived ? 'success' : 'warning'" size="small" variant="flat">
                  {{ calc.paymentReceived ? 'Paid' : 'Pending' }}
                </v-chip>
              </div>
            </div>
          </div>

          <!-- Summary Bar -->
          <div class="payment-summary-bar">
            <div class="psb-item">
              <div class="psb-val text-success">PKR {{ totalAmountPaid.toLocaleString() }}</div>
              <div class="psb-label">Total Paid</div>
            </div>
            <div class="psb-divider"></div>
            <div class="psb-item">
              <div class="psb-val text-warning">PKR {{ totalAmountPending.toLocaleString() }}</div>
              <div class="psb-label">Pending</div>
            </div>
            <div class="psb-divider"></div>
            <div class="psb-item">
              <div class="psb-val">PKR {{ (totalAmountPaid + totalAmountPending).toLocaleString() }}</div>
              <div class="psb-label">Grand Total</div>
            </div>
          </div>
        </v-window-item>

      </v-window>
    </div>

    <!-- ── Empty State ─────────────────────────────────── -->
    <div v-else class="empty-calc section-card">
      <v-icon icon="mdi-calculator-variant-outline" size="80" color="grey-lighten-1"></v-icon>
      <h3 class="mt-4 mb-2 text-grey-darken-1">No Calculations Yet</h3>
      <p class="text-grey">Add members and click "Calculate &amp; Save" to generate the monthly breakdown.</p>
    </div>

  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { calculateMonthlyDistributions, calculateMemberSummary } from '../utils/roscaCalculator'
import { saveMonthlyCalculations, getMonthlyCalculations } from '../services/roscaService'

const props = defineProps({
  groupData: { type: Object, required: true },
  members:   { type: Array, default: () => [] },
  groupId:   { type: String, default: '' }
})
const emit = defineEmits(['saved', 'error'])

const tab            = ref('monthly')
const calculations   = ref([])
const openPanelIndex = ref(null)

// ── Computed ────────────────────────────────────────────────

const totalRoscaCount = computed(() =>
  props.members.reduce((s, m) => s + (m.roscaCount || 0), 0)
)

const canCalculate = computed(() =>
  props.members.length > 0 && totalRoscaCount.value === props.groupData.totalMonths
)

const totalMonthsPaid = computed(() =>
  calculations.value.filter(c => c.paymentReceived).length
)

const assignedMonths = computed(() =>
  calculations.value.filter(c => c.receivingMemberId).length
)

const totalAmountPaid = computed(() =>
  calculations.value.filter(c => c.paymentReceived).reduce((s, c) => s + c.totalPot, 0)
)

const totalAmountPending = computed(() =>
  calculations.value.filter(c => !c.paymentReceived).reduce((s, c) => s + c.totalPot, 0)
)

// ── Helpers ─────────────────────────────────────────────────

const getStatusLabel = (calc) => {
  if (calc.paymentReceived) return 'Paid'
  if (calc.receivingMemberId) return 'Assigned'
  return 'Unassigned'
}

const getTimelineClass = (calc) => {
  if (calc.paymentReceived) return 'tl-paid'
  if (calc.receivingMemberId) return 'tl-assigned'
  return 'tl-pending'
}

const getMonthPanelClass = (calc) => {
  if (calc.paymentReceived) return 'border-success'
  if (calc.receivingMemberId) return 'border-primary'
  return 'border-warning'
}

const getMonthBadgeClass = (calc) => {
  if (calc.paymentReceived) return 'badge-success'
  if (calc.receivingMemberId) return 'badge-primary'
  return 'badge-warning'
}

const formatMonth = (s) => {
  if (!s) return '-'
  const [yr, mo] = s.split('-')
  return new Date(yr, parseInt(mo) - 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
}

const formatDate = (d) => {
  if (!d) return '-'
  const dt = d.toDate ? d.toDate() : new Date(d)
  return dt.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

// ── BUG FIX: getAvailableMembers now shows ALL members ──────
// Members who've used all their rosca slots in OTHER months are shown
// with `isDisabled: true` so the user can see why they can't be selected.
// The currently-selected member is always enabled (so you can change selection).

const getAvailableMembers = (currentMonthIndex) => {
  const currentReceivingMemberId = calculations.value[currentMonthIndex]?.receivingMemberId

  const receivingCounts = new Map()
  calculations.value.forEach((calc, idx) => {
    if (idx === currentMonthIndex) return  // skip current month (we're editing it)
    if (calc.receivingMemberId) {
      receivingCounts.set(
        calc.receivingMemberId,
        (receivingCounts.get(calc.receivingMemberId) || 0) + 1
      )
    }
  })

  return props.members.map(member => {
    const timesReceived  = receivingCounts.get(member.id) || 0
    const roscaCount     = member.roscaCount || 1
    const isAtLimit      = timesReceived >= roscaCount
    const isCurrent      = member.id === currentReceivingMemberId
    const isDisabled     = isAtLimit && !isCurrent

    return {
      ...member,
      isDisabled,
      displayTitle: isDisabled
        ? `${member.name}  (Full — ${timesReceived}/${roscaCount} slots used)`
        : member.name
    }
  })
}

const hasDisabledMembers = (monthIndex) =>
  getAvailableMembers(monthIndex).some(m => m.isDisabled)

const getMemberSummary = (member) => {
  if (!calculations.value.length) return { totalGiven: 0, totalReceived: 0, monthsParticipated: 0 }
  const id = member.id || props.members.indexOf(member)
  return calculateMemberSummary(calculations.value, id)
}

// ── Firebase helpers ────────────────────────────────────────

// Converts Vue reactive proxy + Firestore Timestamps to plain JS before saving
const serializeForFirestore = (data) => {
  if (data === null || data === undefined) return data
  if (data instanceof Date) return data
  if (data && typeof data.toDate === 'function') return data.toDate()
  if (Array.isArray(data)) return data.map(serializeForFirestore)
  if (typeof data === 'object') {
    const plain = {}
    for (const k of Object.keys(data)) plain[k] = serializeForFirestore(data[k])
    return plain
  }
  return data
}

const saveToFirebase = async () => {
  if (!props.groupId) return
  const plain = serializeForFirestore(calculations.value)
  await saveMonthlyCalculations(props.groupId, plain)
}

// ── Actions ─────────────────────────────────────────────────

const togglePaymentStatus = async (monthIndex) => {
  if (!props.groupId || !calculations.value[monthIndex]) return
  const newStatus = !calculations.value[monthIndex].paymentReceived
  calculations.value[monthIndex].paymentReceived = newStatus
  calculations.value[monthIndex].paymentDate = newStatus ? new Date() : null
  try {
    await saveToFirebase()
    emit('saved')
  } catch (err) {
    console.error(err)
    emit('error', err.message)
    calculations.value[monthIndex].paymentReceived = !newStatus
    calculations.value[monthIndex].paymentDate = null
  }
}

const toggleGivenStatus = async (monthIndex, memberId) => {
  if (!props.groupId || !calculations.value[monthIndex]) return
  const member = calculations.value[monthIndex].members.find(m => m.memberId === memberId)
  if (!member) return
  const newStatus = !member.amountGivenStatus
  member.amountGivenStatus = newStatus
  member.amountGivenDate   = newStatus ? new Date() : null
  try {
    await saveToFirebase()
    emit('saved')
  } catch (err) {
    console.error(err)
    emit('error', err.message)
    member.amountGivenStatus = !newStatus
    member.amountGivenDate   = null
  }
}

// BUG FIX: now handles null (clearing an assignment)
const updateReceivingMember = async (monthIndex, memberId) => {
  if (!props.groupId || !calculations.value[monthIndex]) return

  const calc = calculations.value[monthIndex]

  // ── Clear assignment ──
  if (memberId === null || memberId === undefined) {
    const prev = calc.receivingMemberId
    calc.receivingMemberId = null
    calc.receivingMember   = null
    calc.members.forEach(m => { m.amountReceived = 0 })
    try {
      await saveToFirebase()
      emit('saved')
    } catch (err) {
      console.error(err)
      emit('error', 'Failed to clear assignment: ' + err.message)
      // restore
      calc.receivingMemberId = prev
      calc.receivingMember   = props.members.find(m => m.id === prev) || null
      await loadSavedCalculations()
    }
    return
  }

  // ── Assign a member ──
  const selectedMember = props.members.find(m => m.id === memberId)
  if (!selectedMember) return

  const prevId = calc.receivingMemberId
  calc.receivingMemberId = memberId
  calc.receivingMember   = selectedMember

  calc.members.forEach(m => { m.amountReceived = 0 })
  const target = calc.members.find(m => m.memberId === memberId)
  if (target) target.amountReceived = calc.totalPot

  try {
    await saveToFirebase()
    emit('saved')
  } catch (err) {
    console.error(err)
    emit('error', err.message)
    calc.receivingMemberId = prevId
    calc.receivingMember   = props.members.find(m => m.id === prevId) || null
    await loadSavedCalculations()
  }
}

const calculateAndSave = async () => {
  if (!canCalculate.value) return
  try {
    const fresh = calculateMonthlyDistributions(props.groupData, props.members)
    fresh.forEach((c, i) => {
      if (calculations.value[i]) {
        const old = calculations.value[i]
        c.paymentReceived    = old.paymentReceived  || false
        c.paymentDate        = old.paymentDate      || null
        c.receivingMemberId  = old.receivingMemberId || null
        c.receivingMember    = old.receivingMember   || null
        c.members.forEach(m => {
          const om = old.members.find(x => x.memberId === m.memberId)
          if (om) {
            m.amountGivenStatus = om.amountGivenStatus || false
            m.amountGivenDate   = om.amountGivenDate   || null
            m.amountReceived    = om.amountReceived     || 0
          }
        })
        if (c.receivingMemberId) {
          c.members.forEach(m => {
            m.amountReceived = m.memberId === c.receivingMemberId ? c.totalPot : 0
          })
        }
      } else {
        c.paymentReceived   = false
        c.paymentDate       = null
        c.receivingMemberId = null
        c.receivingMember   = null
        c.members.forEach(m => {
          m.amountGivenStatus = false
          m.amountGivenDate   = null
          m.amountReceived    = 0
        })
      }
    })
    calculations.value = fresh
    if (props.groupId) {
      await saveToFirebase()
      emit('saved')
    }
  } catch (err) {
    console.error(err)
    emit('error', err.message)
  }
}

const loadSavedCalculations = async () => {
  if (!props.groupId) return
  try {
    const saved = await getMonthlyCalculations(props.groupId)
    if (saved.length > 0 && saved[0].calculations) {
      calculations.value = saved[0].calculations
    }
  } catch (err) {
    console.error(err)
  }
}

onMounted(() => loadSavedCalculations())
watch(() => props.groupId, () => { if (props.groupId) loadSavedCalculations() })
</script>

<style scoped>
/* ── Layout ─────────────────────────────────────────────── */
.calculations-wrapper {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.section-card {
  background: var(--bg-glass-strong);
  backdrop-filter: blur(20px);
  border-radius: var(--radius-xl);
  padding: 28px;
  border: 1px solid var(--border-subtle);
  box-shadow: var(--shadow-md);
}

/* ── Header ─────────────────────────────────────────────── */
.calc-header { padding: 20px 24px; }

.section-heading {
  font-size: 20px;
  font-weight: 800;
  color: var(--text-primary);
  margin: 0;
  letter-spacing: -0.02em;
}
.section-sub {
  font-size: 13px;
  margin: 0;
  color: var(--text-muted);
  font-weight: 500;
}

.calc-tabs :deep(.v-tab--selected) {
  font-weight: 700;
}

/* ── Stats Pills ─────────────────────────────────────────── */
.stats-pills {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}
.stat-pill {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 18px;
  border-radius: var(--radius-full);
  font-size: 13px;
  font-weight: 600;
  border: 1px solid transparent;
  transition: transform var(--duration-fast) var(--ease-spring);
}
.stat-pill:hover { transform: translateY(-2px); }
.green-pill  { background: rgba(16,185,129,0.1); color: var(--color-success-dark); border-color: rgba(16,185,129,0.2); }
.amber-pill  { background: rgba(245,158,11,0.1); color: var(--color-warning-dark); border-color: rgba(245,158,11,0.2); }
.blue-pill   { background: rgba(13,148,136,0.1); color: #0f766e; border-color: rgba(13,148,136,0.2); }
.teal-pill   { background: rgba(5,150,105,0.1); color: var(--brand-primary-dark); border-color: rgba(5,150,105,0.2); }

/* ── Timeline ────────────────────────────────────────────── */
.timeline-card { padding: 20px 24px; }
.timeline-label {
  font-size: 12px;
  font-weight: 700;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.06em;
}
.timeline-track {
  display: flex;
  align-items: center;
  flex-wrap: nowrap;
  gap: 0;
  margin: 16px 0 12px;
  padding: 8px 4px;
  overflow-x: auto;
  width: 100%;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: thin;
}
.timeline-dot {
  width: 42px; height: 42px;
  border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  cursor: pointer;
  transition: transform var(--duration-normal) var(--ease-spring), box-shadow var(--duration-normal);
  flex-shrink: 0;
}
.timeline-dot:hover { transform: scale(1.15); box-shadow: var(--shadow-md); }
.dot-num { font-size: 12px; font-weight: 800; color: white; }
.dot-line { flex: 1; height: 3px; background: var(--border-default); min-width: 6px; max-width: 40px; border-radius: 2px; }

.tl-paid     { background: linear-gradient(135deg, #10b981, #059669); box-shadow: 0 2px 8px rgba(16,185,129,0.35); }
.tl-assigned { background: var(--brand-gradient); box-shadow: 0 2px 8px rgba(5,150,105,0.35); }
.tl-pending  { background: var(--bg-muted); border: 2px solid var(--border-default); }
.tl-pending .dot-num { color: var(--text-muted); }

.legend-item {
  display: flex; align-items: center; gap: 6px;
  font-size: 12px; color: var(--text-muted); font-weight: 500;
}
.leg-dot { width: 10px; height: 10px; border-radius: 50%; display: inline-block; }
.paid-dot     { background: var(--color-success); }
.assigned-dot { background: var(--brand-primary); }
.pending-dot  { background: var(--bg-muted); border: 2px solid var(--text-muted); }

/* ── Expansion Panels ────────────────────────────────────── */
.month-panels { display: flex; flex-direction: column; gap: 10px; }

.month-panel {
  border-radius: var(--radius-md) !important;
  overflow: hidden;
  border-left: 4px solid var(--border-default) !important;
  box-shadow: var(--shadow-sm) !important;
  background: var(--bg-muted) !important;
  transition: box-shadow var(--duration-normal), transform var(--duration-normal);
}
.month-panel:hover { box-shadow: var(--shadow-md) !important; }

.border-success { border-left-color: var(--color-success) !important; }
.border-primary { border-left-color: var(--brand-primary) !important; }
.border-warning { border-left-color: var(--color-warning) !important; }

.panel-title-custom { padding: 16px 20px !important; min-height: unset !important; }

.panel-header-grid {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}
.month-badge {
  width: 42px; height: 42px;
  border-radius: var(--radius-sm);
  display: flex; align-items: center; justify-content: center;
  font-size: 15px; font-weight: 800; color: white;
  flex-shrink: 0;
}
.badge-success { background: linear-gradient(135deg, #10b981, #059669); }
.badge-primary { background: var(--brand-gradient); }
.badge-warning { background: linear-gradient(135deg, #f59e0b, #d97706); }

.month-name-text { font-size: 16px; font-weight: 700; color: var(--text-primary); }
.receiver-label  { font-size: 12px; color: var(--text-muted); display: flex; align-items: center; }
.pot-text        { font-size: 18px; font-weight: 800; color: var(--text-primary); letter-spacing: -0.02em; }

/* ── Panel Body ──────────────────────────────────────────── */
.panel-body { padding: 4px 0 8px; display: flex; flex-direction: column; gap: 20px; }

.assignment-card {
  background: var(--brand-gradient-subtle);
  border: 1px solid var(--border-strong);
  border-radius: var(--radius-md);
  padding: 18px 20px;
}
.assignment-card-title {
  display: flex; align-items: center; gap: 8px;
  font-size: 12px; font-weight: 700; color: var(--text-secondary);
  text-transform: uppercase; letter-spacing: 0.05em;
  margin-bottom: 14px;
}
.assignment-card-body {
  display: flex; align-items: flex-start; gap: 14px;
}
.hint-bar {
  display: flex; align-items: flex-start; gap: 4px;
  background: rgba(245,158,11,0.08);
  border-radius: var(--radius-xs); padding: 8px 12px;
  border: 1px solid rgba(245,158,11,0.15);
}

.totals-row { display: flex; gap: 12px; flex-wrap: wrap; }
.total-chip-card {
  flex: 1; min-width: 120px;
  background: var(--bg-elevated);
  border-radius: var(--radius-sm);
  padding: 14px 16px;
  box-shadow: var(--shadow-xs);
  border: 1px solid var(--border-subtle);
  transition: transform var(--duration-fast);
}
.total-chip-card:hover { transform: translateY(-2px); }
.tc-label {
  font-size: 10px; color: var(--text-muted);
  font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 4px;
}
.tc-value  { font-size: 16px; font-weight: 800; color: var(--text-primary); }
.success-val { color: var(--color-success-dark); }

/* Members Table */
.members-table {
  display: flex; flex-direction: column; gap: 4px;
  border: 1px solid var(--border-subtle); border-radius: var(--radius-md); overflow: hidden;
}
.mt-header {
  display: grid;
  grid-template-columns: 2fr 0.7fr 1.2fr 1fr 1fr;
  gap: 12px; padding: 12px 16px;
  background: var(--bg-muted);
  font-size: 10px; font-weight: 700; color: var(--text-muted);
  text-transform: uppercase; letter-spacing: 0.06em;
}
.mt-row {
  display: grid;
  grid-template-columns: 2fr 0.7fr 1.2fr 1fr 1fr;
  gap: 12px; padding: 12px 16px;
  align-items: center;
  transition: background var(--duration-fast);
  background: var(--bg-elevated);
}
.mt-row:hover { background: var(--bg-hover); }
.mt-row-receiver { background: linear-gradient(90deg, rgba(16,185,129,0.06) 0%, transparent 100%); }
.tc { text-align: center; }
.tr { text-align: right; }
.mt-name { font-size: 14px; font-weight: 600; color: var(--text-primary); }
.mt-amount-grey  { font-size: 13px; color: var(--text-muted); font-weight: 500; }
.mt-amount-green { font-size: 13px; font-weight: 700; color: var(--color-success-dark); }

/* ── Summary Tab ─────────────────────────────────────────── */
.summary-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(230px, 1fr));
  gap: 14px;
}
.summary-card {
  background: var(--bg-muted);
  border-radius: var(--radius-md);
  padding: 24px 20px;
  text-align: center;
  border: 1px solid var(--border-subtle);
  transition: all var(--duration-normal) var(--ease-spring);
}
.summary-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-md);
  border-color: var(--border-strong);
  background: var(--bg-elevated);
}
.sc-name  { font-size: 16px; font-weight: 700; color: var(--text-primary); margin-bottom: 4px; }
.sc-stats { display: flex; align-items: center; justify-content: center; gap: 0; margin: 16px 0 12px; }
.sc-stat  { flex: 1; }
.sc-stat-val   { font-size: 14px; font-weight: 800; margin-bottom: 2px; }
.sc-stat-label { font-size: 10px; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.04px; font-weight: 600; }
.sc-divider    { width: 1px; height: 36px; background: var(--border-default); }
.sc-net {
  font-size: 13px; font-weight: 700;
  padding: 6px 14px; border-radius: var(--radius-xs);
  display: inline-block;
}
.net-positive { background: rgba(16,185,129,0.1); color: var(--color-success-dark); }
.net-negative { background: rgba(239,68,68,0.1); color: var(--color-error-dark); }

/* ── Payment History Tab ─────────────────────────────────── */
.payment-list { display: flex; flex-direction: column; gap: 8px; margin-bottom: 20px; }
.payment-item {
  display: flex; align-items: center; justify-content: space-between;
  padding: 16px 20px; border-radius: var(--radius-md);
  border-left: 4px solid var(--border-default);
  background: var(--bg-muted);
  transition: all var(--duration-normal) var(--ease-smooth);
}
.payment-item:hover { transform: translateX(4px); box-shadow: var(--shadow-sm); }
.pi-paid    { border-left-color: var(--color-success); background: linear-gradient(90deg, rgba(16,185,129,0.06), var(--bg-muted)); }
.pi-pending { border-left-color: var(--color-warning); background: linear-gradient(90deg, rgba(245,158,11,0.06), var(--bg-muted)); }
.pi-left    { display: flex; align-items: center; }
.pi-month   { font-size: 15px; font-weight: 700; color: var(--text-primary); }
.pi-recipient { font-size: 12px; color: var(--text-muted); display: flex; align-items: center; margin-top: 2px; }
.pi-right   { display: flex; flex-direction: column; align-items: flex-end; gap: 6px; }
.pi-amount  { font-size: 18px; font-weight: 800; color: var(--text-primary); letter-spacing: -0.02em; }

.payment-summary-bar {
  display: flex; align-items: center;
  background: var(--bg-muted); border-radius: var(--radius-md); padding: 20px 28px;
  border: 1px solid var(--border-subtle);
}
.psb-item { flex: 1; text-align: center; }
.psb-val   { font-size: 22px; font-weight: 800; margin-bottom: 4px; letter-spacing: -0.02em; }
.psb-label { font-size: 10px; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.05em; font-weight: 600; }
.psb-divider { width: 1px; height: 48px; background: var(--border-default); }

/* ── Empty State ─────────────────────────────────────────── */
.empty-calc {
  text-align: center;
  padding: 60px 24px;
}
.empty-calc h3 { font-size: 20px; font-weight: 700; color: var(--text-primary); }

.gap-3 { gap: 12px; }

@media (max-width: 768px) {
  .section-card { padding: 20px; }
  .mt-header, .mt-row {
    grid-template-columns: 1.5fr 1fr 1fr;
  }
  .mt-header > :nth-child(4),
  .mt-header > :nth-child(5),
  .mt-row > :nth-child(4),
  .mt-row > :nth-child(5) { display: none; }
  .panel-header-grid { flex-direction: column; align-items: flex-start; }
}
</style>