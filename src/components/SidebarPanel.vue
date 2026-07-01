<template>
  <div class="sidebar-inner">
    <div class="sidebar-head">
      <div class="sidebar-icon">
        <v-icon icon="mdi-folder-multiple" size="18" color="white"></v-icon>
      </div>
      <h2 class="sidebar-title">Your Groups</h2>
    </div>

    <div class="create-btn-wrap">
      <v-btn
        color="primary"
        variant="tonal"
        block
        prepend-icon="mdi-plus"
        class="create-btn"
        @click="$emit('create')"
      >
        New Group
      </v-btn>
    </div>

    <div v-if="groups.length > 0" class="group-list">
      <div
        v-for="group in groups"
        :key="group.id"
        class="group-item"
        :class="{ 'group-active': selectedGroup?.id === group.id }"
        @click="$emit('select', group)"
      >
        <div class="gi-icon">
          <v-icon
            :icon="selectedGroup?.id === group.id ? 'mdi-folder-open' : 'mdi-folder'"
            size="22"
            :color="selectedGroup?.id === group.id ? 'primary' : undefined"
          ></v-icon>
        </div>
        <div class="gi-info">
          <div class="gi-name">{{ group.name }}</div>
          <div class="gi-meta">
            <span><v-icon size="11">mdi-calendar</v-icon> {{ group.totalMonths }}mo</span>
            <span><v-icon size="11">mdi-cash</v-icon> {{ group.monthlyAmount.toLocaleString() }}</span>
          </div>
        </div>
        <v-btn
          icon="mdi-delete-outline" size="x-small"
          variant="text" color="error"
          class="gi-del"
          @click.stop="$emit('delete', group.id)"
        ></v-btn>
      </div>
    </div>

    <div v-else class="sidebar-empty">
      <v-icon icon="mdi-folder-open-outline" size="56" color="disabled"></v-icon>
      <p>No groups yet.<br>Create one to get started!</p>
    </div>
  </div>
</template>

<script setup>
defineProps({
  groups: { type: Array, default: () => [] },
  selectedGroup: { type: Object, default: null }
})
defineEmits(['select', 'create', 'delete'])
</script>

<style scoped>
.sidebar-inner {
  padding: 20px 16px;
  height: 100%;
  display: flex;
  flex-direction: column;
}
.sidebar-head {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
  padding: 0 4px;
}
.sidebar-title {
  font-size: 17px;
  font-weight: 800;
  color: var(--text-primary);
  margin: 0;
  letter-spacing: -0.02em;
}
.sidebar-icon {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: var(--brand-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.create-btn-wrap {
  flex: 0 0 auto;
  margin-bottom: 12px;
  padding: 0 2px;
}
.create-btn {
  font-weight: 600 !important;
  height: 42px !important;
  min-height: 42px !important;
  max-height: 42px !important;
  flex: 0 0 auto !important;
}

.group-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
  overflow-y: auto;
  padding: 0 2px;
}
.group-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 14px;
  border-radius: var(--radius-sm);
  cursor: pointer;
  background: transparent;
  border: 1.5px solid transparent;
  border-left: 3px solid transparent;
  transition: all var(--duration-normal) var(--ease-smooth);
  position: relative;
}
.group-item:hover {
  background: var(--bg-hover);
  transform: translateX(4px);
}
.group-active {
  background: var(--brand-gradient-subtle) !important;
  border-left-color: var(--brand-primary) !important;
  border-top-color: transparent !important;
  border-right-color: transparent !important;
  border-bottom-color: transparent !important;
}
.gi-info { flex: 1; min-width: 0; }
.gi-name {
  font-size: 14px;
  font-weight: 700;
  color: var(--text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.gi-meta {
  display: flex;
  gap: 10px;
  margin-top: 3px;
  font-size: 11px;
  color: var(--text-muted);
  font-weight: 500;
}
.gi-meta span { display: flex; align-items: center; gap: 3px; }
.gi-del { opacity: 0; transition: opacity var(--duration-fast); }
.group-item:hover .gi-del { opacity: 1; }
.sidebar-empty {
  text-align: center;
  padding: 32px 16px;
  color: var(--text-muted);
  font-size: 14px;
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}
</style>
