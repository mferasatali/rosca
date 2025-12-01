<template>
  <div class="app-container">
    <!-- Modern Header -->
    <v-app-bar 
      color="transparent" 
      elevation="0" 
      class="modern-header"
      height="70"
      fixed
    >
      <div class="header-content">
        <div class="logo-section">
          <div class="logo-icon">
            <v-icon icon="mdi-account-group" size="32" color="primary"></v-icon>
          </div>
          <div class="logo-text">
            <h1 class="app-title">Rosca</h1>
            <p class="app-subtitle">Manage Your Rosca</p>
          </div>
        </div>
        <v-spacer></v-spacer>
        <v-chip 
          v-if="selectedGroup" 
          color="success" 
          variant="flat" 
          size="large"
          class="selected-chip"
        >
          <v-icon start icon="mdi-check-circle"></v-icon>
          {{ selectedGroup.name }}
        </v-chip>
      </div>
    </v-app-bar>

    <v-main class="main-content">
      <div class="content-wrapper">
        <div class="layout-grid">
          <!-- Left Sidebar - Groups -->
          <div class="sidebar-section">
            <div class="glass-card groups-card">
              <div class="card-header">
                <div class="d-flex align-center mb-4">
                  <div class="icon-wrapper primary">
                    <v-icon icon="mdi-folder-multiple" size="24"></v-icon>
                  </div>
                  <h2 class="card-title">Your Groups</h2>
                </div>
              </div>
              
              <v-btn 
                color="primary" 
                size="x-large"
                block 
                class="create-btn mb-6" 
                @click="showGroupForm = true"
                prepend-icon="mdi-plus-circle"
                variant="flat"
              >
                Create New Group
              </v-btn>

              <div v-if="groups.length > 0" class="groups-list">
                <div
                  v-for="group in groups"
                  :key="group.id"
                  :class="['group-item', { 'active': selectedGroup?.id === group.id }]"
                  @click="selectGroup(group)"
                >
                  <div class="group-icon">
                    <v-icon 
                      :icon="selectedGroup?.id === group.id ? 'mdi-folder-open' : 'mdi-folder'" 
                      size="28"
                    ></v-icon>
                  </div>
                  <div class="group-info">
                    <h3 class="group-name">{{ group.name }}</h3>
                    <div class="group-meta">
                      <span class="meta-item">
                        <v-icon icon="mdi-calendar" size="14"></v-icon>
                        {{ group.totalMonths }} months
                      </span>
                      <span class="meta-item">
                        <v-icon icon="mdi-cash" size="14"></v-icon>
                        PKR {{ group.monthlyAmount.toLocaleString() }}
                      </span>
                    </div>
                  </div>
                  <v-btn 
                    icon="mdi-delete-outline" 
                    variant="text" 
                    color="error"
                    size="small"
                    @click.stop="deleteGroup(group.id)"
                    class="delete-btn"
                  ></v-btn>
                </div>
              </div>
              
              <div v-else class="empty-state">
                <div class="empty-icon">
                  <v-icon icon="mdi-folder-open-outline" size="64"></v-icon>
                </div>
                <h3 class="empty-title">No groups yet</h3>
                <p class="empty-text">Create your first Rosca group to get started!</p>
              </div>
            </div>
          </div>

          <!-- Right Content Area -->
          <div class="content-section" v-if="selectedGroup">
            <!-- Group Overview Cards -->
            <div class="stats-grid mb-6">
              <div class="stat-card">
                <div class="stat-icon blue">
                  <v-icon icon="mdi-calendar-month" size="28"></v-icon>
                </div>
                <div class="stat-content">
                  <div class="stat-value">{{ selectedGroup.totalMonths }}</div>
                  <div class="stat-label">Total Months</div>
                </div>
              </div>
              
              <div class="stat-card">
                <div class="stat-icon green">
                  <v-icon icon="mdi-cash" size="28"></v-icon>
                </div>
                <div class="stat-content">
                  <div class="stat-value">PKR {{ selectedGroup.monthlyAmount.toLocaleString() }}</div>
                  <div class="stat-label">Monthly Amount</div>
                </div>
              </div>
              
              <div class="stat-card">
                <div class="stat-icon purple">
                  <v-icon icon="mdi-calendar-start" size="28"></v-icon>
                </div>
                <div class="stat-content">
                  <div class="stat-value">{{ formatMonth(selectedGroup.startMonth) }}</div>
                  <div class="stat-label">Start Month</div>
                </div>
              </div>
              
              <div class="stat-card" :class="totalRoscaCount === selectedGroup.totalMonths ? 'success-border' : 'warning-border'">
                <div class="stat-icon" :class="totalRoscaCount === selectedGroup.totalMonths ? 'success' : 'warning'">
                  <v-icon 
                    :icon="totalRoscaCount === selectedGroup.totalMonths ? 'mdi-check-circle' : 'mdi-alert-circle'" 
                    size="28"
                  ></v-icon>
                </div>
                <div class="stat-content">
                  <div class="stat-value">{{ totalRoscaCount }} / {{ selectedGroup.totalMonths }}</div>
                  <div class="stat-label">Rosca Count</div>
                </div>
              </div>
            </div>

            <!-- Members Section -->
            <div class="glass-card mb-6">
              <div class="card-header">
                <div class="d-flex align-center justify-space-between">
                  <div class="d-flex align-center">
                    <div class="icon-wrapper success">
                      <v-icon icon="mdi-account-group" size="24"></v-icon>
                    </div>
                    <h2 class="card-title">Members</h2>
                  </div>
                  <v-btn 
                    color="primary" 
                    prepend-icon="mdi-account-plus"
                    @click="showMemberForm = true"
                    variant="flat"
                    size="large"
                  >
                    Add Member
                  </v-btn>
                </div>
              </div>
              
              <div v-if="members.length > 0" class="members-table">
                <div 
                  v-for="member in members" 
                  :key="member.id"
                  class="member-row"
                >
                  <div class="member-avatar">
                    <v-avatar color="primary" size="40">
                      {{ member.name.charAt(0).toUpperCase() }}
                    </v-avatar>
                  </div>
                  <div class="member-info">
                    <div class="member-name">{{ member.name }}</div>
                    <div class="member-details">
                      <v-chip size="small" color="primary" variant="flat">
                        {{ member.roscaCount }} Rosca
                      </v-chip>
                      <span v-if="member.phone" class="member-phone">
                        <v-icon icon="mdi-phone" size="14"></v-icon>
                        {{ member.phone }}
                      </span>
                    </div>
                  </div>
                  <div class="member-actions">
                    <v-btn 
                      icon="mdi-pencil" 
                      size="small" 
                      variant="text"
                      color="primary"
                      @click="editMember(member)"
                    ></v-btn>
                    <v-btn 
                      icon="mdi-delete" 
                      size="small" 
                      variant="text"
                      color="error"
                      @click="deleteMember(member.id)"
                    ></v-btn>
                  </div>
                </div>
              </div>
              
              <div v-else class="empty-state">
                <div class="empty-icon">
                  <v-icon icon="mdi-account-off-outline" size="64"></v-icon>
                </div>
                <h3 class="empty-title">No members yet</h3>
                <p class="empty-text">Add members to start managing your Rosca group</p>
              </div>
            </div>

            <!-- Calculations Section -->
            <MonthlyCalculations
              :group-data="selectedGroup"
              :members="members"
              :group-id="selectedGroup.id"
              @saved="handleCalculationsSaved"
              @error="(msg) => showSnackbar(msg, 'error', 'mdi-alert-circle')"
            />
          </div>

          <!-- Empty State -->
          <div class="content-section" v-else>
            <div class="glass-card empty-main">
              <div class="empty-icon-large">
                <v-icon icon="mdi-folder-open-outline" size="120"></v-icon>
              </div>
              <h2 class="empty-title-large">Select a Group</h2>
              <p class="empty-text-large">Choose a group from the sidebar to view details and manage members</p>
            </div>
          </div>
        </div>
      </div>
    </v-main>

    <!-- Dialogs -->
    <v-dialog v-model="showGroupForm" max-width="700" persistent>
      <RoscaGroupForm
        :group="editingGroup"
        @submit="handleGroupSubmit"
        @cancel="closeGroupForm"
      />
    </v-dialog>

    <v-dialog v-model="showMemberForm" max-width="700" persistent>
      <MemberForm
        :member="editingMember"
        @submit="handleMemberSubmit"
        @cancel="closeMemberForm"
      />
    </v-dialog>

    <!-- Loading Overlay -->
    <v-overlay :model-value="loading" class="align-center justify-center">
      <div class="loading-container">
        <v-progress-circular indeterminate size="64" color="primary"></v-progress-circular>
        <div class="loading-text">Loading...</div>
      </div>
    </v-overlay>

    <!-- Snackbar -->
    <v-snackbar 
      v-model="snackbar.show" 
      :color="snackbar.color" 
      timeout="3000" 
      location="top"
      rounded="lg"
      elevation="8"
    >
      <div class="d-flex align-center">
        <v-icon :icon="snackbar.icon" class="mr-2"></v-icon>
        {{ snackbar.message }}
      </div>
    </v-snackbar>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import RoscaGroupForm from './RoscaGroupForm.vue'
import MemberForm from './MemberForm.vue'
import MonthlyCalculations from './MonthlyCalculations.vue'
import {
  createRoscaGroup,
  getRoscaGroups,
  updateRoscaGroup,
  deleteRoscaGroup,
  addMember,
  getMembers,
  updateMember,
  deleteMember as deleteMemberService
} from '../services/roscaService'

const groups = ref([])
const selectedGroup = ref(null)
const members = ref([])
const loading = ref(false)
const showGroupForm = ref(false)
const showMemberForm = ref(false)
const editingGroup = ref(null)
const editingMember = ref(null)
const snackbar = ref({
  show: false,
  message: '',
  color: 'success',
  icon: 'mdi-check-circle'
})

const totalRoscaCount = computed(() => {
  return members.value.reduce((sum, member) => sum + (member.roscaCount || 0), 0)
})

onMounted(async () => {
  await loadGroups()
})

const loadGroups = async () => {
  try {
    loading.value = true
    groups.value = await getRoscaGroups()
  } catch (error) {
    console.error('Error loading groups:', error)
    showSnackbar('Error loading groups: ' + error.message, 'error', 'mdi-alert-circle')
  } finally {
    loading.value = false
  }
}

const selectGroup = async (group) => {
  selectedGroup.value = group
  editingGroup.value = null
  await loadMembers(group.id)
}

const loadMembers = async (groupId) => {
  try {
    loading.value = true
    members.value = await getMembers(groupId)
  } catch (error) {
    console.error('Error loading members:', error)
    showSnackbar('Error loading members: ' + error.message, 'error', 'mdi-alert-circle')
  } finally {
    loading.value = false
  }
}

const handleGroupSubmit = async (groupData) => {
  try {
    loading.value = true
    if (editingGroup.value) {
      await updateRoscaGroup(editingGroup.value.id, groupData)
      showSnackbar('Group updated successfully!', 'success', 'mdi-check-circle')
    } else {
      const groupId = await createRoscaGroup(groupData)
      groupData.id = groupId
      groups.value.unshift(groupData)
      showSnackbar('Group created successfully!', 'success', 'mdi-check-circle')
    }
    await loadGroups()
    closeGroupForm()
  } catch (error) {
    console.error('Error saving group:', error)
    showSnackbar('Error saving group: ' + error.message, 'error', 'mdi-alert-circle')
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
  editingGroup.value = null
}

const deleteGroup = async (groupId) => {
  if (!confirm('Are you sure you want to delete this group? This action cannot be undone.')) {
    return
  }
  try {
    loading.value = true
    await deleteRoscaGroup(groupId)
    if (selectedGroup.value?.id === groupId) {
      selectedGroup.value = null
      members.value = []
    }
    await loadGroups()
    showSnackbar('Group deleted successfully!', 'success', 'mdi-check-circle')
  } catch (error) {
    console.error('Error deleting group:', error)
    showSnackbar('Error deleting group: ' + error.message, 'error', 'mdi-alert-circle')
  } finally {
    loading.value = false
  }
}

const handleMemberSubmit = async (memberData) => {
  if (!selectedGroup.value) {
    showSnackbar('Please select a group first', 'warning', 'mdi-alert')
    return
  }
  try {
    loading.value = true
    if (editingMember.value) {
      await updateMember(selectedGroup.value.id, editingMember.value.id, memberData)
      showSnackbar('Member updated successfully!', 'success', 'mdi-check-circle')
    } else {
      await addMember(selectedGroup.value.id, memberData)
      showSnackbar('Member added successfully!', 'success', 'mdi-check-circle')
    }
    await loadMembers(selectedGroup.value.id)
    closeMemberForm()
  } catch (error) {
    console.error('Error saving member:', error)
    showSnackbar('Error saving member: ' + error.message, 'error', 'mdi-alert-circle')
  } finally {
    loading.value = false
  }
}

const editMember = (member) => {
  editingMember.value = { ...member }
  showMemberForm.value = true
}

const closeMemberForm = () => {
  showMemberForm.value = false
  editingMember.value = null
}

const deleteMember = async (memberId) => {
  if (!confirm('Are you sure you want to delete this member?')) {
    return
  }
  try {
    loading.value = true
    await deleteMemberService(selectedGroup.value.id, memberId)
    await loadMembers(selectedGroup.value.id)
    showSnackbar('Member deleted successfully!', 'success', 'mdi-check-circle')
  } catch (error) {
    console.error('Error deleting member:', error)
    showSnackbar('Error deleting member: ' + error.message, 'error', 'mdi-alert-circle')
  } finally {
    loading.value = false
  }
}

const handleCalculationsSaved = () => {
  showSnackbar('Calculations saved successfully!', 'success', 'mdi-check-circle')
}

const showSnackbar = (message, color = 'success', icon = 'mdi-check-circle') => {
  snackbar.value = { show: true, message, color, icon }
}

const formatMonth = (monthString) => {
  if (!monthString) return '-'
  const [year, month] = monthString.split('-')
  const date = new Date(year, parseInt(month) - 1)
  return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
}
</script>

<style scoped>
.app-container {
  width: 100%;
  min-height: 100vh;
  background: linear-gradient(135deg, #F1F5F9 0%, #E2E8F0 50%, #CBD5E1 100%);
  background-attachment: fixed;
  overflow-x: hidden;
}

.modern-header {
  backdrop-filter: blur(20px);
  background: rgba(255, 255, 255, 0.85) !important;
  border-bottom: 1px solid rgba(0, 0, 0, 0.08);
  padding: 0 24px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.header-content {
  max-width: 100%;
  width: 100%;
  display: flex;
  align-items: center;
  padding: 0 16px;
}

.main-content {
  padding-top: 70px !important;
  width: 100%;
  min-height: calc(100vh - 70px);
}

.content-wrapper {
  width: 100%;
  height: 100%;
  padding: 20px;
}

.layout-grid {
  display: grid;
  grid-template-columns: 380px 1fr;
  gap: 20px;
  max-width: 100%;
  height: 100%;
}

.sidebar-section {
  min-width: 0;
}

.content-section {
  min-width: 0;
  overflow-y: auto;
  overflow-x: hidden;
  max-height: calc(100vh - 110px);
  padding-right: 8px;
  padding-bottom: 20px;
}

.content-section::-webkit-scrollbar {
  width: 8px;
}

.content-section::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  margin: 8px 0;
}

.content-section::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.3);
  border-radius: 10px;
  border: 2px solid transparent;
  background-clip: padding-box;
}

.content-section::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.5);
  background-clip: padding-box;
}

.logo-section {
  display: flex;
  align-items: center;
  gap: 16px;
}

.logo-icon {
  width: 56px;
  height: 56px;
  border-radius: 14px;
  background: linear-gradient(135deg, #0891B2 0%, #0D9488 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(8, 145, 178, 0.2);
}

.logo-text {
  color: #1e293b;
}

.app-title {
  font-size: 28px;
  font-weight: 700;
  margin: 0;
  color: #0F172A;
  letter-spacing: -0.5px;
}

.app-subtitle {
  font-size: 14px;
  margin: 0;
  color: #64748B;
  font-weight: 500;
}

.main-content {
  padding-top: 70px !important;
  width: 100%;
  min-height: calc(100vh - 70px);
}

.glass-card {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 20px;
  padding: 32px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08), 0 0 0 1px rgba(0, 0, 0, 0.04);
  border: 1px solid rgba(0, 0, 0, 0.06);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.glass-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12), 0 0 0 1px rgba(0, 0, 0, 0.06);
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
  box-shadow: 0 2px 8px rgba(8, 145, 178, 0.2);
  transition: all 0.3s ease;
}

.icon-wrapper.primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(8, 145, 178, 0.3);
}

.icon-wrapper.success {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
}

.create-btn {
  border-radius: 12px;
  height: 56px;
  font-weight: 600;
  font-size: 16px;
  box-shadow: 0 2px 8px rgba(8, 145, 178, 0.2);
  transition: all 0.3s ease;
}

.create-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(8, 145, 178, 0.3);
}

.groups-card {
  height: fit-content;
  max-height: calc(100vh - 160px);
  overflow-y: auto;
  overflow-x: hidden;
  position: sticky;
  top: 80px;
}

.groups-card::-webkit-scrollbar {
  width: 6px;
}

.groups-card::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 10px;
}

.groups-card::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.2);
  border-radius: 10px;
}

.groups-card::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 0, 0, 0.3);
}

.groups-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.group-item {
  display: flex;
  align-items: center;
  padding: 20px;
  border-radius: 16px;
  background: white;
  border: 2px solid transparent;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.group-item:hover {
  transform: translateX(4px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
}

.group-item.active {
  background: linear-gradient(135deg, rgba(8, 145, 178, 0.1) 0%, rgba(13, 148, 136, 0.1) 100%);
  border-color: #0891B2;
  box-shadow: 0 4px 20px rgba(8, 145, 178, 0.2);
  transform: translateX(4px);
}

.group-icon {
  margin-right: 16px;
  color: #0891B2;
}

.group-info {
  flex: 1;
}

.group-name {
  font-size: 18px;
  font-weight: 700;
  margin: 0 0 8px 0;
  color: #1e293b;
}

.group-meta {
  display: flex;
  gap: 16px;
  font-size: 14px;
  color: #64748b;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 4px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
}

.stat-card {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 20px;
  padding: 24px;
  display: flex;
  align-items: center;
  gap: 16px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  border: 1px solid rgba(0, 0, 0, 0.06);
  transition: all 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
}

.stat-icon {
  width: 64px;
  height: 64px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.stat-icon.blue {
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
}

.stat-icon.green {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
}

.stat-icon.purple {
  background: linear-gradient(135deg, #0891B2 0%, #0D9488 100%);
}

.stat-icon.success {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
}

.stat-icon.warning {
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
}

.stat-content {
  flex: 1;
}

.stat-value {
  font-size: 24px;
  font-weight: 800;
  color: #1e293b;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 14px;
  color: #64748b;
  font-weight: 500;
}

.success-border {
  border-color: #10b981;
}

.warning-border {
  border-color: #f59e0b;
}

.members-table {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.member-row {
  display: flex;
  align-items: center;
  padding: 20px;
  border-radius: 16px;
  background: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
}

.member-row:hover {
  transform: translateX(4px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
}

.member-avatar {
  margin-right: 16px;
}

.member-info {
  flex: 1;
}

.member-name {
  font-size: 18px;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 8px;
}

.member-details {
  display: flex;
  align-items: center;
  gap: 12px;
}

.member-phone {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 14px;
  color: #64748b;
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

.empty-main {
  text-align: center;
  padding: 80px 24px;
}

.empty-icon-large {
  margin-bottom: 24px;
  opacity: 0.3;
}

.empty-title-large {
  font-size: 32px;
  font-weight: 800;
  color: #1e293b;
  margin-bottom: 12px;
}

.empty-text-large {
  font-size: 16px;
  color: #64748b;
}

.loading-container {
  background: white;
  padding: 48px;
  border-radius: 24px;
  text-align: center;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
}

.loading-text {
  margin-top: 16px;
  font-size: 16px;
  font-weight: 600;
  color: #1e293b;
}

.selected-chip {
  font-weight: 600;
  font-size: 14px;
}

/* Responsive Design */
@media (max-width: 1200px) {
  .layout-grid {
    grid-template-columns: 340px 1fr;
    gap: 16px;
  }
  
  .content-wrapper {
    padding: 16px;
  }
}

@media (max-width: 960px) {
  .layout-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }
  
  .sidebar-section {
    order: 2;
  }
  
  .content-section {
    order: 1;
    max-height: none;
  }
  
  .groups-card {
    position: relative;
    top: 0;
    max-height: none;
  }
  
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
  }
  
  .header-content {
    padding: 0 12px;
  }
  
  .logo-section {
    gap: 12px;
  }
  
  .app-title {
    font-size: 22px;
  }
  
  .app-subtitle {
    font-size: 12px;
  }
  
  .logo-icon {
    width: 48px;
    height: 48px;
  }
  
  .glass-card {
    padding: 24px;
  }
  
  .content-wrapper {
    padding: 12px;
  }
}

@media (max-width: 600px) {
  .stats-grid {
    grid-template-columns: 1fr;
    gap: 12px;
  }
  
  .app-title {
    font-size: 20px;
  }
  
  .app-subtitle {
    display: none;
  }
  
  .logo-icon {
    width: 44px;
    height: 44px;
  }
  
  .modern-header {
    padding: 0 12px;
    height: 60px;
  }
  
  .main-content {
    padding-top: 60px !important;
  }
  
  .content-section {
    max-height: calc(100vh - 100px);
  }
  
  .glass-card {
    padding: 20px;
    border-radius: 20px;
  }
  
  .card-title {
    font-size: 20px;
  }
  
  .group-item {
    padding: 16px;
  }
  
  .group-name {
    font-size: 16px;
  }
  
  .stat-card {
    padding: 20px;
  }
  
  .stat-value {
    font-size: 20px;
  }
  
  .member-row {
    padding: 16px;
    flex-wrap: wrap;
    gap: 12px;
  }
  
  .content-wrapper {
    padding: 8px;
  }
  
  .layout-grid {
    gap: 12px;
  }
}

@media (max-width: 400px) {
  .header-content {
    padding: 0 8px;
  }
  
  .logo-text {
    display: none;
  }
  
  .selected-chip {
    font-size: 12px;
    padding: 4px 8px;
  }
  
  .create-btn {
    height: 48px;
    font-size: 14px;
  }
  
  .glass-card {
    padding: 16px;
  }
}
</style>
