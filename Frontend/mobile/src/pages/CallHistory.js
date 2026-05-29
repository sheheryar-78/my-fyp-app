import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, ActivityIndicator, FlatList } from 'react-native';
import { Filter, FileText, X, Star, Phone, Bot, Clock, MessageSquare, ChevronDown } from 'lucide-react-native';
import API from '../services/api';

export default function CallHistory() {
  const [calls, setCalls] = useState([]);
  const [selectedCall, setSelectedCall] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({ sentiment: "" });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCalls();
  }, []);

  const fetchCalls = async () => {
    try {
      const res = await API.get("/calls");
      setCalls(res.data);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  const filteredCalls = calls.filter((call) => {
    if (filters.sentiment && call.sentiment !== filters.sentiment) {
      return false;
    }
    return true;
  });

  const handleRate = async (id, rating) => {
    try {
      const res = await API.put(`/calls/${id}/rate`, { rating });
      setCalls(calls.map((call) => (call._id === id ? res.data : call)));
      setSelectedCall(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  const getSentimentBadge = (sentiment) => {
    switch (sentiment) {
      case "positive":
        return (
          <View style={[styles.badge, styles.badgePositive]}>
            <View style={[styles.badgeDot, { backgroundColor: '#22C55E' }]} />
            <Text style={styles.badgeTextPositive}>Positive</Text>
          </View>
        );
      case "negative":
        return (
          <View style={[styles.badge, styles.badgeNegative]}>
            <View style={[styles.badgeDot, { backgroundColor: '#EF4444' }]} />
            <Text style={styles.badgeTextNegative}>Negative</Text>
          </View>
        );
      default:
        return (
          <View style={[styles.badge, styles.badgeNeutral]}>
            <View style={[styles.badgeDot, { backgroundColor: '#6B7280' }]} />
            <Text style={styles.badgeTextNeutral}>Neutral</Text>
          </View>
        );
    }
  };

  const renderCallItem = ({ item }) => (
    <TouchableOpacity style={styles.callCard} onPress={() => setSelectedCall(item)}>
      <View style={styles.callCardHeader}>
        <View style={styles.callerInfo}>
          <View style={styles.phoneIconWrapper}>
            <Phone size={16} color="#2563EB" />
          </View>
          <View>
            <Text style={styles.callerName}>{item.caller}</Text>
            <View style={styles.agentInfo}>
              <Bot size={12} color="#6B7280" />
              <Text style={styles.agentName}>{item.agent}</Text>
            </View>
          </View>
        </View>
        {getSentimentBadge(item.sentiment)}
      </View>
      <View style={styles.callCardFooter}>
        <View style={styles.durationInfo}>
          <Clock size={14} color="#9CA3AF" />
          <Text style={styles.durationText}>{item.duration}</Text>
        </View>
        <Text style={styles.dateText}>
          {new Date(item.createdAt).toLocaleDateString()}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Call History</Text>
          <Text style={styles.subtitle}>Review your AI agents' recent interactions.</Text>
        </View>
        <TouchableOpacity 
          style={[styles.filterButton, showFilters && styles.filterButtonActive]} 
          onPress={() => setShowFilters(!showFilters)}
        >
          <Filter size={16} color={showFilters ? "#1D4ED8" : "#4B5563"} />
          <Text style={[styles.filterText, showFilters && styles.filterTextActive]}>
            {showFilters ? "Hide" : "Filters"}
          </Text>
        </TouchableOpacity>
      </View>

      {showFilters && (
        <View style={styles.filtersContainer}>
          <Text style={styles.filterLabel}>Sentiment Filter</Text>
          <View style={styles.filterOptions}>
            {["", "positive", "neutral", "negative"].map(opt => (
              <TouchableOpacity 
                key={opt}
                style={[styles.filterChip, filters.sentiment === opt && styles.filterChipActive]}
                onPress={() => setFilters({ ...filters, sentiment: opt })}
              >
                <Text style={[styles.filterChipText, filters.sentiment === opt && styles.filterChipTextActive]}>
                  {opt === "" ? "All" : opt.charAt(0).toUpperCase() + opt.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#2563EB" />
        </View>
      ) : (
        <FlatList
          data={filteredCalls}
          keyExtractor={(item) => item._id}
          renderItem={renderCallItem}
          contentContainerStyle={styles.listContainer}
          ListEmptyComponent={
            <Text style={styles.emptyText}>No calls found matching your criteria.</Text>
          }
        />
      )}

      {/* Premium Modal */}
      <Modal visible={!!selectedCall} animationType="slide" transparent={true} onRequestClose={() => setSelectedCall(null)}>
        {selectedCall && (
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <View style={styles.modalHeaderInfo}>
                  <View style={styles.modalPhoneIcon}>
                    <Phone size={20} color="#2563EB" />
                  </View>
                  <View>
                    <Text style={styles.modalCallerName}>{selectedCall.caller}</Text>
                    <View style={styles.modalAgentInfo}>
                      <Bot size={14} color="#9CA3AF" />
                      <Text style={styles.modalAgentName}>Handled by {selectedCall.agent}</Text>
                    </View>
                  </View>
                </View>
                <TouchableOpacity onPress={() => setSelectedCall(null)} style={styles.closeBtn}>
                  <X size={24} color="#9CA3AF" />
                </TouchableOpacity>
              </View>

              <ScrollView style={styles.modalBody} contentContainerStyle={{padding: 20}}>
                <View style={styles.summaryCard}>
                  <View style={styles.summaryHeader}>
                    <MessageSquare size={16} color="#3B82F6" />
                    <Text style={styles.summaryTitle}>CALL SUMMARY</Text>
                  </View>
                  <Text style={styles.summaryText}>
                    {selectedCall.summary || "No summary generated for this interaction."}
                  </Text>
                </View>

                {(!selectedCall.transcript || selectedCall.transcript.length === 0) ? (
                  <Text style={styles.noTranscript}>Transcript not available for this call.</Text>
                ) : (
                  selectedCall.transcript.map((msg, index) => {
                    const isCustomer = msg.speaker === "customer";
                    return (
                      <View key={index} style={[styles.messageWrapper, isCustomer ? styles.msgStart : styles.msgEnd]}>
                        <Text style={styles.messageMeta}>
                          {isCustomer ? "CUSTOMER" : "AI AGENT"} • {msg.timestamp}
                        </Text>
                        <View style={[styles.messageBubble, isCustomer ? styles.bubbleCustomer : styles.bubbleAgent]}>
                          <Text style={[styles.messageText, isCustomer ? styles.textCustomer : styles.textAgent]}>
                            {msg.message}
                          </Text>
                        </View>
                      </View>
                    );
                  })
                )}
              </ScrollView>

              <View style={styles.modalFooter}>
                <View>
                  <Text style={styles.rateLabel}>RATE INTERACTION</Text>
                  <View style={styles.starsContainer}>
                    {[1, 2, 3, 4, 5].map((rating) => (
                      <TouchableOpacity key={rating} onPress={() => handleRate(selectedCall._id, rating)}>
                        <Star 
                          size={24} 
                          color={rating <= (selectedCall.rating || 0) ? "#FACC15" : "#E5E7EB"} 
                          fill={rating <= (selectedCall.rating || 0) ? "#FACC15" : "transparent"} 
                        />
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
                <View style={styles.durationWrapper}>
                  <Text style={styles.rateLabel}>DURATION</Text>
                  <Text style={styles.durationBold}>{selectedCall.duration}</Text>
                </View>
              </View>
            </View>
          </View>
        )}
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { padding: 16, paddingTop: 40, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { fontSize: 24, fontWeight: 'bold', color: '#111827' },
  subtitle: { fontSize: 14, color: '#6B7280', marginTop: 4 },
  filterButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, borderWidth: 1, borderColor: '#D1D5DB' },
  filterButtonActive: { backgroundColor: '#EFF6FF', borderColor: '#BFDBFE' },
  filterText: { marginLeft: 6, color: '#4B5563', fontWeight: '500' },
  filterTextActive: { color: '#1D4ED8' },
  filtersContainer: { backgroundColor: '#FFF', marginHorizontal: 16, marginBottom: 16, padding: 16, borderRadius: 12, borderWidth: 1, borderColor: '#E5E7EB' },
  filterLabel: { fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 8 },
  filterOptions: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  filterChip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, backgroundColor: '#F3F4F6', borderWidth: 1, borderColor: '#E5E7EB' },
  filterChipActive: { backgroundColor: '#EFF6FF', borderColor: '#93C5FD' },
  filterChipText: { fontSize: 12, color: '#4B5563' },
  filterChipTextActive: { color: '#1D4ED8', fontWeight: '600' },
  listContainer: { padding: 16 },
  emptyText: { textAlign: 'center', color: '#6B7280', marginTop: 20 },
  callCard: { backgroundColor: '#FFF', borderRadius: 12, padding: 16, marginBottom: 12, elevation: 1, shadowColor: '#000', shadowOffset: {width: 0, height: 1}, shadowOpacity: 0.05, shadowRadius: 2 },
  callCardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
  callerInfo: { flexDirection: 'row', alignItems: 'center' },
  phoneIconWrapper: { width: 36, height: 36, borderRadius: 8, backgroundColor: '#EFF6FF', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  callerName: { fontSize: 16, fontWeight: 'bold', color: '#111827' },
  agentInfo: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  agentName: { fontSize: 12, color: '#6B7280', marginLeft: 4 },
  badge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12, borderWidth: 1 },
  badgeDot: { width: 6, height: 6, borderRadius: 3, marginRight: 4 },
  badgePositive: { backgroundColor: '#DCFCE7', borderColor: '#BBF7D0' },
  badgeTextPositive: { fontSize: 10, fontWeight: '600', color: '#15803D' },
  badgeNegative: { backgroundColor: '#FEE2E2', borderColor: '#FECACA' },
  badgeTextNegative: { fontSize: 10, fontWeight: '600', color: '#B91C1C' },
  badgeNeutral: { backgroundColor: '#F3F4F6', borderColor: '#E5E7EB' },
  badgeTextNeutral: { fontSize: 10, fontWeight: '600', color: '#374151' },
  callCardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#F9FAFB', padding: 8, borderRadius: 8, borderWidth: 1, borderColor: '#F3F4F6' },
  durationInfo: { flexDirection: 'row', alignItems: 'center' },
  durationText: { fontSize: 12, color: '#4B5563', marginLeft: 6 },
  dateText: { fontSize: 12, color: '#6B7280' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(17, 24, 39, 0.5)', justifyContent: 'flex-end' },
  modalContent: { width: '100%', height: '85%', backgroundColor: '#FFF', borderTopLeftRadius: 24, borderTopRightRadius: 24, overflow: 'hidden', elevation: 5 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, backgroundColor: '#F8FAFC', borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  modalHeaderInfo: { flexDirection: 'row', alignItems: 'center' },
  modalPhoneIcon: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#DBEAFE', justifyContent: 'center', alignItems: 'center', marginRight: 16, borderWidth: 1, borderColor: '#BFDBFE' },
  modalCallerName: { fontSize: 20, fontWeight: 'bold', color: '#111827' },
  modalAgentInfo: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  modalAgentName: { fontSize: 14, fontWeight: '500', color: '#6B7280', marginLeft: 6 },
  closeBtn: { padding: 8, backgroundColor: '#F1F5F9', borderRadius: 12 },
  modalBody: { flex: 1, backgroundColor: '#F8FAFC' },
  summaryCard: { backgroundColor: '#FFF', padding: 16, borderRadius: 16, marginBottom: 24, borderWidth: 1, borderColor: '#E5E7EB' },
  summaryHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  summaryTitle: { fontSize: 12, fontWeight: 'bold', color: '#111827', marginLeft: 8 },
  summaryText: { fontSize: 14, color: '#374151', lineHeight: 22 },
  noTranscript: { textAlign: 'center', padding: 24, color: '#9CA3AF', fontStyle: 'italic', backgroundColor: '#FFF', borderRadius: 16, borderWidth: 1, borderColor: '#E5E7EB', borderStyle: 'dashed' },
  messageWrapper: { marginBottom: 16 },
  msgStart: { alignItems: 'flex-start' },
  msgEnd: { alignItems: 'flex-end' },
  messageMeta: { fontSize: 10, fontWeight: 'bold', color: '#9CA3AF', marginBottom: 4, paddingHorizontal: 4 },
  messageBubble: { maxWidth: '80%', padding: 12, borderRadius: 16 },
  bubbleCustomer: { backgroundColor: '#FFF', borderWidth: 1, borderColor: '#E5E7EB', borderTopLeftRadius: 4 },
  textCustomer: { color: '#1F2937', fontSize: 14 },
  bubbleAgent: { backgroundColor: '#2563EB', borderTopRightRadius: 4 },
  textAgent: { color: '#FFF', fontSize: 14 },
  modalFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, backgroundColor: '#FFF', borderTopWidth: 1, borderTopColor: '#F1F5F9' },
  rateLabel: { fontSize: 10, fontWeight: 'bold', color: '#6B7280', marginBottom: 8 },
  starsContainer: { flexDirection: 'row', gap: 4 },
  durationWrapper: { alignItems: 'flex-end' },
  durationBold: { fontSize: 20, fontWeight: '900', color: '#111827', fontFamily: 'monospace' }
});
