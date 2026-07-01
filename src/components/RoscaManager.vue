<template>
  <div class="app-root app-mesh-bg">

    <!-- ═══ Top Navigation ═══ -->
    <v-app-bar color="transparent" elevation="0" class="app-bar" :height="68" fixed>
      <div class="bar-inner">
        <v-btn
          v-if="isMobile"
          icon variant="text"
          class="menu-btn"
          @click="drawerOpen = true"
        >
          <v-icon icon="mdi-menu" size="24"></v-icon>
        </v-btn>

        <div class="logo-wrap">
          <div class="logo-icon">
            <v-icon icon="mdi-account-group" size="26" color="white"></v-icon>
          </div>
          <div class="logo-text">
            <span class="logo-title">Rosca</span>
            <span class="logo-sub">Kameeti Manager</span>
          </div>
        </div>

        <v-spacer></v-spacer>

        <v-chip
          v-if="selectedGroup && !isMobile"
          color="primary" variant="flat" size="large"
          prepend-icon="mdi-folder-open" class="active-chip"
        >
          {{ selectedGroup.name }}
          <template #append>
            <v-btn icon="mdi-pencil" size="x-small" variant="text" class="ml-1" @click="editGroup"></v-btn>
          </template>
        </v-chip>

        <v-btn
          :icon="isDark ? 'mdi-weather-sunny' : 'mdi-weather-night'"
          variant="text"
          class="theme-btn"
          @click="$emit('toggle-theme')"
          :title="isDark ? 'Light mode' : 'Dark mode'"
        ></v-btn>
      </div>
    </v-app-bar>

    <!-- ═══ Mobile Drawer ═══ -->
    <v-navigation-drawer
      v-if="isMobile"
      v-model="drawerOpen"
      temporary
      location="left"
      width="300"
      class="mobile-drawer"
    >
      <SidebarPanel
        :groups="groups"
        :selected-group="selectedGroup"
        @select="onSelectGroup"
        @create="showGroupForm = true; drawerOpen = false"
        @delete="deleteGroup"
      />
    </v-navigation-drawer>

    <!-- ═══ Main Layout ═══ -->
    <v-main class="app-main">
      <div class="app-shell">

        <!-- Desktop Sidebar -->
        <aside v-if="!isMobile" class="sidebar animate-in animate-in-1">
          <SidebarPanel
            :groups="groups"
            :selected-group="selectedGroup"
            @select="onSelectGroup"
            @create="showGroupForm = true"
            @delete="deleteGroup"
          />
        </aside>

        <!-- Main Content -->
        <div class="main-content">
          <div class="content-area" v-if="selectedGroup">
            <!-- Stats Row -->
            <div class="overview-row mb-5 animate-in animate-in-2">
              <div class="stat-card" data-color="blue">
                <div class="stat-icon"><v-icon icon="mdi-calendar-month" size="24" color="white"></v-icon></div>
                <div class="stat-body">
                  <div class="stat-val">{{ selectedGroup.totalMonths }}</div>
                  <div class="stat-label">Total Months</div>
                </div>
              </div>
              <div class="stat-card" data-color="green">
                <div class="stat-icon"><v-icon icon="mdi-cash" size="24" color="white"></v-icon></div>
                <div class="stat-body">
                  <div class="stat-val stat-val-sm">PKR {{ selectedGroup.monthlyAmount.toLocaleString() }}</div>
                  <div class="stat-label">Monthly Amount</div>
                </div>
              </div>
              <div class="stat-card" data-color="teal">
                <div class="stat-icon"><v-icon icon="mdi-calendar-start" size="24" color="white"></v-icon></div>
                <div class="stat-body">
                  <div class="stat-val">{{ formatMonth(selectedGroup.startMonth) }}</div>
                  <div class="stat-label">Start Month</div>
                </div>
              </div>
              <div class="stat-card" :data-color="totalRoscaCount === selectedGroup.totalMonths ? 'success' : 'warning'">
                <div class="stat-icon">
                  <v-icon
                    :icon="totalRoscaCount === selectedGroup.totalMonths ? 'mdi-check-circle' : 'mdi-alert-circle'"
                    size="24" color="white"
                  ></v-icon>
                </div>
                <div class="stat-body">
                  <div class="stat-val">{{ totalRoscaCount }} / {{ selectedGroup.totalMonths }}</div>
                  <div class="stat-label">Rosca Count</div>
                </div>
              </div>
              <v-btn
                icon="mdi-cog-outline"
                size="small"
                variant="text"
                color="primary"
                class="edit-group-btn"
                @click="editGroup"
                title="Edit Group"
              ></v-btn>
            </div>

            <!-- Members -->
            <div class="section-card mb-5 animate-in animate-in-3">
              <div class="section-head">
                <div class="d-flex align-center gap-3">
                  <div class="icon-badge icon-badge--success">
                    <v-icon icon="mdi-account-group" size="20" color="white"></v-icon>
                  </div>
                  <div>
                    <h2 class="section-title">Members</h2>
                    <p class="section-sub">
                      {{ members.length }} member{{ members.length !== 1 ? 's' : '' }} ·
                      Rosca total: {{ totalRoscaCount }}/{{ selectedGroup.totalMonths }}
                    </p>
                  </div>
                </div>
                <v-btn
                  color="primary" variant="tonal"
                  prepend-icon="mdi-account-plus"
                  @click="showMemberForm = true"
                >
                  Add Member
                </v-btn>
              </div>

              <div v-if="members.length > 0" class="members-grid">
                <div
                  v-for="(member, idx) in members"
                  :key="member.id"
                  class="member-card"
                  :style="{ animationDelay: `${idx * 50}ms` }"
                >
                  <div class="member-avatar" :style="{ '--hue': getAvatarHue(member.name) }">
                    <span>{{ member.name.charAt(0).toUpperCase() }}</span>
                  </div>
                  <div class="member-info">
                    <div class="member-name">{{ member.name }}</div>
                    <div class="d-flex align-center gap-2 mt-1 flex-wrap">
                      <v-chip color="primary" size="x-small" variant="tonal">
                        {{ member.roscaCount }} Rosca
                      </v-chip>
                      <span v-if="member.phone" class="member-phone">
                        <v-icon size="12">mdi-phone</v-icon>{{ member.phone }}
                      </span>
                    </div>
                    <div class="progress-wrap mt-2">
                      <div
                        class="progress-bar"
                        :style="{ width: Math.min((member.roscaCount / selectedGroup.totalMonths) * 100, 100) + '%' }"
                      ></div>
                    </div>
                    <div class="progress-label">
                      {{ Math.round((member.roscaCount / selectedGroup.totalMonths) * 100) }}% of rosca pool
                    </div>
                  </div>
                  <div class="member-actions">
                    <v-btn icon="mdi-pencil-outline" size="x-small" variant="text" color="primary" @click="editMember(member)"></v-btn>
                    <v-btn icon="mdi-delete-outline" size="x-small" variant="text" color="error" @click="confirmDeleteMember(member)"></v-btn>
                  </div>
                </div>
              </div>

              <div v-else class="empty-state">
                <div class="empty-icon-ring">
                  <v-icon icon="mdi-account-plus-outline" size="48" color="primary"></v-icon>
                </div>
                <p>Add members to start managing your Rosca group</p>
                <v-btn color="primary" variant="tonal" prepend-icon="mdi-account-plus" class="mt-3" @click="showMemberForm = true">
                  Add First Member
                </v-btn>
              </div>
            </div>

            <div class="animate-in animate-in-4">
              <MonthlyCalculations
                :group-data="selectedGroup"
                :members="members"
                :group-id="selectedGroup.id"
                @saved="handleCalculationsSaved"
                @error="msg => showSnackbar(msg, 'error', 'mdi-alert-circle')"
              />
            </div>
          </div>

          <!-- Empty State -->
          <div class="content-area content-area--empty" v-else>
            <div class="empty-main animate-in animate-in-2">
              <div class="empty-hero">
                <div class="empty-hero-ring">
                  <v-icon icon="mdi-account-group-outline" size="72" color="primary"></v-icon>
                </div>
                <h2 class="empty-hero-title">Select a Group</h2>
                <p class="empty-hero-sub">Choose a group from the sidebar, or create a new one to get started.</p>
                <v-btn
                  color="primary" variant="flat" size="large" rounded="xl"
                  prepend-icon="mdi-plus-circle"
                  class="mt-5 pulse-glow"
                  @click="showGroupForm = true"
                >
                  Create First Group
                </v-btn>
              </div>
            </div>
          </div>
        </div>

      </div>
    </v-main>

    <!-- ═══ Dialogs ═══ -->
    <v-dialog v-model="showGroupForm" max-width="680" scrollable>
      <RoscaGroupForm
        :group="editingGroup"
        @submit="handleGroupSubmit"
        @cancel="closeGroupForm"
      />
    </v-dialog>

    <v-dialog v-model="showMemberForm" max-width="600" scrollable>
      <MemberForm
        :member="editingMember"
        @submit="handleMemberSubmit"
        @cancel="closeMemberForm"
      />
    </v-dialog>

    <!-- Confirm Delete Dialog -->
    <v-dialog v-model="confirmDialog.show" max-width="420">
      <div class="confirm-dialog glass-surface">
        <div class="confirm-icon" :class="confirmDialog.type">
          <v-icon :icon="confirmDialog.type === 'error' ? 'mdi-delete-alert' : 'mdi-alert'" size="32" color="white"></v-icon>
        </div>
        <h3 class="confirm-title">{{ confirmDialog.title }}</h3>
        <p class="confirm-msg">{{ confirmDialog.message }}</p>
        <div class="confirm-actions">
          <v-btn variant="outlined" size="large" @click="confirmDialog.show = false">Cancel</v-btn>
          <v-btn :color="confirmDialog.type === 'error' ? 'error' : 'warning'" variant="flat" size="large" @click="confirmDialog.onConfirm()">
            {{ confirmDialog.confirmText }}
          </v-btn>
        </div>
      </div>
    </v-dialog>

    <!-- Loading -->
    <v-overlay
      :model-value="loading"
      class="align-center justify-center loading-overlay"
      persistent
      scrim="rgba(0,0,0,0.35)"
    >
      <div class="loading-box">
        <v-progress-circular indeterminate size="56" color="primary" width="3"></v-progress-circular>
        <div class="loading-label">Loading…</div>
      </div>
    </v-overlay>

    <!-- Snackbar -->
    <v-snackbar
      v-model="snackbar.show"
      :color="snackbar.color"
      timeout="3500"
      location="top right"
      rounded="lg"
      elevation="8"
    >
      <div class="d-flex align-center gap-2">
        <v-icon :icon="snackbar.icon" size="20"></v-icon>
        {{ snackbar.message }}
      </div>
      <template #actions>
        <v-btn icon="mdi-close" size="x-small" variant="text" @click="snackbar.show = false"></v-btn>
      </template>
    </v-snackbar>

  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import RoscaGroupForm from './RoscaGroupForm.vue'
import MemberForm from './MemberForm.vue'
import MonthlyCalculations from './MonthlyCalculations.vue'
import SidebarPanel from './SidebarPanel.vue'
import {
  createRoscaGroup, getRoscaGroups, updateRoscaGroup, deleteRoscaGroup,
  addMember, getMembers, updateMember, deleteMember as deleteMemberService
} from '../services/roscaService'

defineProps({ isDark: { type: Boolean, default: false } })
defineEmits(['toggle-theme'])

const groups        = ref([])
const selectedGroup = ref(null)
const members       = ref([])
const loading       = ref(false)
const showGroupForm  = ref(false)
const showMemberForm = ref(false)
const editingGroup   = ref(null)
const editingMember  = ref(null)
const drawerOpen     = ref(false)
const isMobile       = ref(false)
const snackbar       = ref({ show: false, message: '', color: 'success', icon: 'mdi-check-circle' })
const confirmDialog  = ref({ show: false, title: '', message: '', confirmText: 'Confirm', type: 'error', onConfirm: () => {} })

const totalRoscaCount = computed(() =>
  members.value.reduce((s, m) => s + (m.roscaCount || 0), 0)
)

const checkMobile = () => { isMobile.value = window.innerWidth < 900 }
onMounted(() => { checkMobile(); window.addEventListener('resize', checkMobile); loadGroups() })
onUnmounted(() => window.removeEventListener('resize', checkMobile))

const getAvatarHue = (name) => {
  let hash = 0
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash)
  // Clamp to green–teal–blue range (no purple)
  return 120 + (Math.abs(hash) % 80)
}

const onSelectGroup = async (group) => {
  drawerOpen.value = false
  await selectGroup(group)
}

const loadGroups = async () => {
  try {
    loading.value = true
    groups.value = await getRoscaGroups()
  } catch (e) {
    showSnackbar('Error loading groups: ' + e.message, 'error', 'mdi-alert-circle')
  } finally {
    loading.value = false
  }
}

const selectGroup = async (group) => {
  selectedGroup.value = group
  editingGroup.value  = null
  await loadMembers(group.id)
}

const loadMembers = async (groupId) => {
  try {
    loading.value = true
    members.value = await getMembers(groupId)
  } catch (e) {
    showSnackbar('Error loading members: ' + e.message, 'error', 'mdi-alert-circle')
  } finally {
    loading.value = false
  }
}

const handleGroupSubmit = async (data) => {
  try {
    loading.value = true
    if (editingGroup.value) {
      await updateRoscaGroup(editingGroup.value.id, data)
      if (selectedGroup.value?.id === editingGroup.value.id) {
        selectedGroup.value = { ...selectedGroup.value, ...data }
      }
      showSnackbar('Group updated!', 'success', 'mdi-check-circle')
    } else {
      const id = await createRoscaGroup(data)
      data.id = id
      showSnackbar('Group created!', 'success', 'mdi-check-circle')
    }
    await loadGroups()
    closeGroupForm()
  } catch (e) {
    showSnackbar('Error saving group: ' + e.message, 'error', 'mdi-alert-circle')
  } finally {
    loading.value = false
  }
}

const editGroup = () => {
  editingGroup.value = { ...selectedGroup.value }
  showGroupForm.value = true
}

const closeGroupForm = () => {
  showGroupForm.value = false
  editingGroup.value  = null
}

const deleteGroup = (groupId) => {
  confirmDialog.value = {
    show: true,
    title: 'Delete Group?',
    message: 'This will permanently delete the group and all its data. This cannot be undone.',
    confirmText: 'Delete',
    type: 'error',
    onConfirm: async () => {
      confirmDialog.value.show = false
      try {
        loading.value = true
        await deleteRoscaGroup(groupId)
        if (selectedGroup.value?.id === groupId) {
          selectedGroup.value = null
          members.value = []
        }
        await loadGroups()
        showSnackbar('Group deleted.', 'success', 'mdi-check-circle')
      } catch (e) {
        showSnackbar('Error deleting group: ' + e.message, 'error', 'mdi-alert-circle')
      } finally {
        loading.value = false
      }
    }
  }
}

const handleMemberSubmit = async (data) => {
  if (!selectedGroup.value) {
    showSnackbar('Select a group first.', 'warning', 'mdi-alert')
    return
  }
  try {
    loading.value = true
    if (editingMember.value) {
      await updateMember(selectedGroup.value.id, editingMember.value.id, data)
      showSnackbar('Member updated!', 'success', 'mdi-check-circle')
    } else {
      await addMember(selectedGroup.value.id, data)
      showSnackbar('Member added!', 'success', 'mdi-check-circle')
    }
    await loadMembers(selectedGroup.value.id)
    closeMemberForm()
  } catch (e) {
    showSnackbar('Error saving member: ' + e.message, 'error', 'mdi-alert-circle')
  } finally {
    loading.value = false
  }
}

const editMember = (member) => {
  editingMember.value  = { ...member }
  showMemberForm.value = true
}

const closeMemberForm = () => {
  showMemberForm.value = false
  editingMember.value  = null
}

const confirmDeleteMember = (member) => {
  confirmDialog.value = {
    show: true,
    title: 'Remove Member?',
    message: `Are you sure you want to remove "${member.name}" from this group?`,
    confirmText: 'Remove',
    type: 'warning',
    onConfirm: async () => {
      confirmDialog.value.show = false
      try {
        loading.value = true
        await deleteMemberService(selectedGroup.value.id, member.id)
        await loadMembers(selectedGroup.value.id)
        showSnackbar('Member removed.', 'success', 'mdi-check-circle')
      } catch (e) {
        showSnackbar('Error removing member: ' + e.message, 'error', 'mdi-alert-circle')
      } finally {
        loading.value = false
      }
    }
  }
}

const handleCalculationsSaved = () =>
  showSnackbar('Calculations saved!', 'success', 'mdi-check-circle')

const showSnackbar = (message, color = 'success', icon = 'mdi-check-circle') => {
  snackbar.value = { show: true, message, color, icon }
}

const formatMonth = (s) => {
  if (!s) return '-'
  const [yr, mo] = s.split('-')
  return new Date(yr, parseInt(mo) - 1).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
}
</script>

<style scoped>
/* ── Root ── */
.app-root {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

/* ── App Bar ── */
.app-bar {
  backdrop-filter: blur(24px) saturate(180%) !important;
  -webkit-backdrop-filter: blur(24px) saturate(180%) !important;
  background: var(--bg-glass) !important;
  border-bottom: 1px solid var(--border-subtle) !important;
  box-shadow: var(--shadow-xs) !important;
}
.bar-inner {
  width: 100%;
  display: flex;
  align-items: center;
  padding: 0 24px;
  gap: 12px;
}
.logo-wrap { display: flex; align-items: center; gap: 14px; }
.logo-icon {
  width: 42px; height: 42px; border-radius: 12px;
  background: var(--brand-primary);
  display: flex; align-items: center; justify-content: center;
  transition: transform var(--duration-normal) var(--ease-spring);
}
.logo-wrap:hover .logo-icon { transform: scale(1.03); }
.logo-title { font-size: 22px; font-weight: 800; color: var(--text-primary); display: block; line-height: 1.1; letter-spacing: -0.03em; }
.logo-sub { font-size: 11px; color: var(--text-muted); font-weight: 600; display: block; text-transform: uppercase; letter-spacing: 0.08em; }
.active-chip { font-weight: 700 !important; }
.theme-btn { opacity: 0.7; transition: opacity var(--duration-fast); }
.theme-btn:hover { opacity: 1; }

/* ── Full-Viewport Shell ── */
.app-main {
  height: 100vh !important;
  padding-top: var(--app-bar-height) !important;
  padding-left: 0 !important;
  padding-right: 0 !important;
  padding-bottom: 0 !important;
  overflow: hidden;
  box-sizing: border-box;
}
.app-shell {
  display: flex;
  height: 100%;
  min-height: 0;
}
.main-content {
  flex: 1;
  min-width: 0;
  overflow-y: auto;
  height: 100%;
}
.content-area {
  min-width: 0;
  padding: 20px 24px 32px;
  min-height: 100%;
}
.content-area--empty {
  display: flex;
  align-items: center;
  justify-content: center;
}

/* ── Sidebar ── */
.sidebar {
  width: var(--sidebar-width);
  flex-shrink: 0;
  height: 100%;
  border-right: 1px solid var(--border-subtle);
  background: var(--bg-glass-strong);
  overflow-y: auto;
}

/* ── Section Card ── */
.section-card {
  background: var(--bg-elevated);
  border-radius: var(--radius-md);
  padding: 24px;
  border: 1px solid var(--border-subtle);
  box-shadow: var(--shadow-sm);
  transition: box-shadow var(--duration-normal);
}
.section-card:hover {
  box-shadow: var(--shadow-md);
}

/* ── Stats ── */
.overview-row {
  display: grid;
  grid-template-columns: repeat(4, 1fr) auto;
  gap: 14px;
  align-items: stretch;
}
.stat-card {
  background: var(--bg-elevated);
  border-radius: var(--radius-md);
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 14px;
  border: 1px solid var(--border-subtle);
  box-shadow: var(--shadow-sm);
  transition: transform var(--duration-normal) var(--ease-spring), box-shadow var(--duration-normal);
  position: relative;
  overflow: hidden;
}
.stat-card::before {
  content: '';
  position: absolute;
  top: 0; left: 0;
  width: 3px; height: 100%;
  border-radius: 3px 0 0 3px;
}
.stat-card[data-color="blue"]::before    { background: linear-gradient(180deg, #0d9488, #0f766e); }
.stat-card[data-color="green"]::before   { background: linear-gradient(180deg, #10b981, #059669); }
.stat-card[data-color="teal"]::before    { background: linear-gradient(180deg, #14b8a6, #0d9488); }
.stat-card[data-color="success"]::before { background: linear-gradient(180deg, #10b981, #059669); }
.stat-card[data-color="warning"]::before { background: linear-gradient(180deg, #f59e0b, #d97706); }
.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.stat-icon {
  width: 48px; height: 48px;
  border-radius: var(--radius-sm);
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}
.stat-card[data-color="blue"] .stat-icon    { background: linear-gradient(135deg, #0d9488, #0f766e); }
.stat-card[data-color="green"] .stat-icon  { background: linear-gradient(135deg, #10b981, #059669); }
.stat-card[data-color="teal"] .stat-icon   { background: linear-gradient(135deg, #14b8a6, #0d9488); }
.stat-card[data-color="success"] .stat-icon { background: linear-gradient(135deg, #10b981, #059669); }
.stat-card[data-color="warning"] .stat-icon { background: linear-gradient(135deg, #f59e0b, #d97706); }

.stat-val { font-size: 22px; font-weight: 800; color: var(--text-primary); letter-spacing: -0.02em; }
.stat-val-sm { font-size: 16px; }
.stat-label { font-size: 11px; color: var(--text-muted); font-weight: 600; text-transform: uppercase; letter-spacing: 0.06em; margin-top: 2px; }
.edit-group-btn { align-self: center; }

/* ── Members ── */
.section-head { display: flex; align-items: center; justify-content: space-between; gap: 16px; flex-wrap: wrap; margin-bottom: 24px; }
.section-title { font-size: 20px; font-weight: 800; color: var(--text-primary); margin: 0; letter-spacing: -0.02em; }
.section-sub { font-size: 13px; margin: 0; color: var(--text-muted); font-weight: 500; }

.members-grid {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.member-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  border-radius: var(--radius-sm);
  background: var(--bg-muted);
  border: 1px solid var(--border-subtle);
  transition: background var(--duration-fast), border-color var(--duration-fast);
  animation: fadeSlideUp var(--duration-slow) var(--ease-smooth) both;
}
.member-card:hover {
  border-color: var(--border-default);
  background: var(--bg-elevated);
}
.member-avatar {
  width: 42px;
  height: 42px;
  border-radius: 12px;
  flex-shrink: 0;
  background: linear-gradient(135deg, hsl(var(--hue), 55%, 40%), hsl(calc(var(--hue) + 20), 55%, 34%));
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  font-weight: 700;
  color: white;
}
.member-info { flex: 1; min-width: 0; }
.member-name { font-size: 14px; font-weight: 700; color: var(--text-primary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.member-phone { font-size: 12px; color: var(--text-muted); display: flex; align-items: center; gap: 4px; }
.member-actions {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 2px;
  flex-shrink: 0;
  margin-left: 8px;
}

.progress-wrap { width: 100%; height: 5px; background: var(--border-subtle); border-radius: var(--radius-full); overflow: hidden; }
.progress-bar { height: 100%; background: var(--brand-gradient); border-radius: var(--radius-full); transition: width var(--duration-slow) var(--ease-smooth); }
.progress-label { font-size: 11px; color: var(--text-muted); margin-top: 4px; font-weight: 500; }

/* ── Empty States ── */
.empty-state { text-align: center; padding: 32px 0; }
.empty-state p { color: var(--text-muted); font-size: 14px; }
.empty-main {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  width: 100%;
  min-height: calc(100vh - var(--app-bar-height) - 80px);
  padding: 40px 24px;
}
.empty-hero-sub { color: var(--text-muted); font-size: 15px; max-width: 400px; }
.empty-icon-ring, .empty-hero-ring {
  width: 110px; height: 110px;
  border-radius: 50%;
  margin: 0 auto 20px;
  background: var(--brand-gradient-subtle);
  border: 2px solid var(--border-strong);
  display: flex; align-items: center; justify-content: center;
}
.empty-hero-title { font-size: 28px; font-weight: 800; color: var(--text-primary); margin: 0 0 8px; letter-spacing: -0.03em; }

/* ── Confirm Dialog ── */
.confirm-dialog { padding: 32px; text-align: center; }
.confirm-icon {
  width: 64px; height: 64px;
  border-radius: 50%;
  margin: 0 auto 20px;
  display: flex; align-items: center; justify-content: center;
}
.confirm-icon.error { background: linear-gradient(135deg, #ef4444, #dc2626); box-shadow: 0 4px 20px rgba(239,68,68,0.35); }
.confirm-icon.warning { background: linear-gradient(135deg, #f59e0b, #d97706); box-shadow: 0 4px 20px rgba(245,158,11,0.35); }
.confirm-title { font-size: 20px; font-weight: 800; color: var(--text-primary); margin-bottom: 8px; }
.confirm-msg { font-size: 14px; color: var(--text-secondary); margin-bottom: 24px; line-height: 1.6; }
.confirm-actions { display: flex; gap: 12px; justify-content: center; }

/* ── Loading (fullscreen centered) ── */
.loading-overlay {
  position: fixed !important;
  inset: 0;
  z-index: 9999;
  backdrop-filter: blur(6px);
}
.loading-overlay :deep(.v-overlay__content) {
  display: flex;
  align-items: center;
  justify-content: center;
}
.loading-box {
  background: var(--bg-elevated);
  padding: 48px 64px;
  border-radius: var(--radius-xl);
  text-align: center;
  box-shadow: var(--shadow-xl), var(--shadow-glow);
  border: 1px solid var(--border-strong);
}
.loading-label { font-size: 15px; font-weight: 600; color: var(--text-secondary); margin-top: 18px; }

/* ── Mobile Drawer ── */
.mobile-drawer :deep(.v-navigation-drawer__content) {
  padding: 0;
  background: var(--bg-base);
}

/* ── Responsive ── */
@media (max-width: 1200px) {
  .overview-row {
    grid-template-columns: repeat(2, 1fr);
  }
  .edit-group-btn {
    grid-column: 1 / -1;
    justify-self: end;
  }
}
@media (max-width: 900px) {
  .sidebar { display: none; }
  .content-area { padding: 16px; }
  .overview-row { grid-template-columns: 1fr; }
  .members-grid { grid-template-columns: 1fr; }
  .section-card { padding: 20px; }
  .empty-main { min-height: calc(100vh - var(--app-bar-height) - 40px); }
}
@media (max-width: 480px) {
  .logo-sub { display: none; }
  .bar-inner { padding: 0 12px; }
}
</style>
