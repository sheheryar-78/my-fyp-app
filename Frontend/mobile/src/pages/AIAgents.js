import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, ActivityIndicator, FlatList, TextInput } from 'react-native';
import { Phone, Power, Plus, X, Trash2 } from 'lucide-react-native';
import API from '../services/api';

export default function AIAgents() {
  const [agents, setAgents] = useState([]);
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [loading, setLoading] = useState(true);

  // Create form state
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');

  useEffect(() => {
    fetchAgents();
  }, []);

  const fetchAgents = async () => {
    try {
      const res = await API.get("/agents");
      setAgents(res.data);
    } catch (err) {
      console.log("Fetch Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAgent = async () => {
    if (!newName || !newPhone) return;
    try {
      const res = await API.post("/agents", { name: newName, phoneNumber: newPhone });
      setAgents([res.data, ...agents]);
      setShowCreateModal(false);
      setNewName('');
      setNewPhone('');
    } catch (err) {
      console.log(err);
    }
  };

  const handleDeleteAgent = async (id) => {
    try {
      await API.delete(`/agents/${id}`);
      setAgents((prev) => prev.filter((a) => a._id !== id));
      setSelectedAgent(null);
    } catch (err) {
      console.log("Delete Error:", err);
    }
  };

  const renderAgent = ({ item }) => (
    <TouchableOpacity style={styles.card} onPress={() => setSelectedAgent(item)}>
      <View style={styles.cardHeader}>
        <View style={styles.cardInfo}>
          <View style={[styles.iconWrapper, item.status === 'active' ? styles.iconActive : styles.iconInactive]}>
            <Phone size={20} color={item.status === 'active' ? '#16A34A' : '#9CA3AF'} />
          </View>
          <View>
            <Text style={styles.agentName}>{item.name}</Text>
            <Text style={styles.agentPhone}>{item.phoneNumber}</Text>
          </View>
        </View>
        <View style={[styles.statusBadge, item.status === 'active' ? styles.badgeActive : styles.badgeInactive]}>
          <Power size={12} color={item.status === 'active' ? '#15803D' : '#4B5563'} />
          <Text style={[styles.statusText, item.status === 'active' ? styles.textActive : styles.textInactive]}>
            {item.status === 'active' ? 'Active' : 'Inactive'}
          </Text>
        </View>
      </View>
      <View style={styles.cardFooter}>
        <View style={styles.footerRow}>
          <Text style={styles.footerLabel}>Document</Text>
          <Text style={styles.footerValue} numberOfLines={1}>
            {item.documents && item.documents.length > 0 ? item.documents[0] : 'None'}
          </Text>
        </View>
        <View style={styles.footerRow}>
          <Text style={styles.footerLabel}>Created</Text>
          <Text style={styles.footerValue}>{item.createdAt ? new Date(item.createdAt).toLocaleDateString() : 'N/A'}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>AI Agents</Text>
          <Text style={styles.subtitle}>Manage your AI voice agents.</Text>
        </View>
        <TouchableOpacity style={styles.createBtn} onPress={() => setShowCreateModal(true)}>
          <Plus size={16} color="#FFF" />
          <Text style={styles.createBtnText}>New Agent</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#2563EB" />
        </View>
      ) : (
        <FlatList
          data={agents}
          keyExtractor={(item) => item._id || Math.random().toString()}
          renderItem={renderAgent}
          contentContainerStyle={styles.listContainer}
          ListEmptyComponent={<Text style={styles.emptyText}>No agents found</Text>}
        />
      )}

      {/* Details/Delete Modal */}
      <Modal visible={!!selectedAgent} animationType="slide" transparent={true} onRequestClose={() => setSelectedAgent(null)}>
        {selectedAgent && (
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Agent Details</Text>
                <TouchableOpacity onPress={() => setSelectedAgent(null)}>
                  <X size={24} color="#6B7280" />
                </TouchableOpacity>
              </View>
              <View style={styles.modalBody}>
                <Text style={styles.label}>Name</Text>
                <Text style={styles.value}>{selectedAgent.name}</Text>
                <Text style={styles.label}>Phone Number</Text>
                <Text style={styles.value}>{selectedAgent.phoneNumber}</Text>
                <Text style={styles.label}>Status</Text>
                <Text style={styles.value}>{selectedAgent.status}</Text>
              </View>
              <View style={styles.modalFooter}>
                <TouchableOpacity style={styles.deleteBtn} onPress={() => handleDeleteAgent(selectedAgent._id)}>
                  <Trash2 size={16} color="#FFF" />
                  <Text style={styles.deleteBtnText}>Delete Agent</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}
      </Modal>

      {/* Create Modal */}
      <Modal visible={showCreateModal} animationType="fade" transparent={true} onRequestClose={() => setShowCreateModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Create New Agent</Text>
              <TouchableOpacity onPress={() => setShowCreateModal(false)}>
                <X size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>
            <View style={styles.modalBody}>
              <Text style={styles.inputLabel}>Agent Name</Text>
              <TextInput style={styles.input} value={newName} onChangeText={setNewName} placeholder="E.g. Sales Bot" />
              
              <Text style={styles.inputLabel}>Phone Number</Text>
              <TextInput style={styles.input} value={newPhone} onChangeText={setNewPhone} placeholder="+1234567890" keyboardType="phone-pad" />
            </View>
            <View style={styles.modalFooter}>
              <TouchableOpacity style={styles.submitBtn} onPress={handleCreateAgent}>
                <Text style={styles.submitBtnText}>Create Agent</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { padding: 16, paddingTop: 40, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#FFF', borderBottomWidth: 1, borderBottomColor: '#E5E7EB' },
  title: { fontSize: 24, fontWeight: 'bold', color: '#111827' },
  subtitle: { fontSize: 14, color: '#6B7280', marginTop: 4 },
  createBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#2563EB', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8 },
  createBtnText: { color: '#FFF', fontWeight: '600', marginLeft: 6 },
  listContainer: { padding: 16 },
  emptyText: { textAlign: 'center', color: '#6B7280', marginTop: 20 },
  card: { backgroundColor: '#FFF', borderRadius: 12, padding: 16, marginBottom: 16, elevation: 2, shadowColor: '#000', shadowOffset: {width: 0, height: 1}, shadowOpacity: 0.05, shadowRadius: 2 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 },
  cardInfo: { flexDirection: 'row', alignItems: 'center' },
  iconWrapper: { padding: 10, borderRadius: 8, marginRight: 12 },
  iconActive: { backgroundColor: '#F0FDF4' },
  iconInactive: { backgroundColor: '#F9FAFB' },
  agentName: { fontSize: 16, fontWeight: 'bold', color: '#111827' },
  agentPhone: { fontSize: 12, color: '#6B7280', marginTop: 2 },
  statusBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  badgeActive: { backgroundColor: '#DCFCE7' },
  badgeInactive: { backgroundColor: '#F3F4F6' },
  textActive: { fontSize: 10, fontWeight: '600', color: '#15803D', marginLeft: 4 },
  textInactive: { fontSize: 10, fontWeight: '600', color: '#4B5563', marginLeft: 4 },
  cardFooter: { borderTopWidth: 1, borderTopColor: '#F3F4F6', paddingTop: 12 },
  footerRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  footerLabel: { fontSize: 12, color: '#6B7280' },
  footerValue: { fontSize: 12, fontWeight: '500', color: '#111827', maxWidth: 150 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 16 },
  modalContent: { backgroundColor: '#FFF', borderRadius: 16, overflow: 'hidden' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', padding: 16, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  modalTitle: { fontSize: 18, fontWeight: 'bold', color: '#111827' },
  modalBody: { padding: 16 },
  label: { fontSize: 12, color: '#6B7280', marginBottom: 4 },
  value: { fontSize: 16, color: '#111827', marginBottom: 16, fontWeight: '500' },
  inputLabel: { fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 8 },
  input: { borderWidth: 1, borderColor: '#D1D5DB', borderRadius: 8, padding: 12, marginBottom: 16, fontSize: 14, color: '#111827' },
  modalFooter: { padding: 16, borderTopWidth: 1, borderTopColor: '#F3F4F6', backgroundColor: '#F9FAFB' },
  deleteBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#EF4444', padding: 12, borderRadius: 8 },
  deleteBtnText: { color: '#FFF', fontWeight: 'bold', marginLeft: 8 },
  submitBtn: { backgroundColor: '#2563EB', padding: 12, borderRadius: 8, alignItems: 'center' },
  submitBtnText: { color: '#FFF', fontWeight: 'bold' }
});
