import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Dimensions } from 'react-native';
import { Phone, Bot, ThumbsUp, Clock, TrendingUp, ArrowUp, ArrowDown } from 'lucide-react-native';
import API from '../services/api';

const { width } = Dimensions.get('window');

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [calls, setCalls] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return isNaN(date.getTime()) 
      ? "N/A" 
      : date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  useEffect(() => {
    fetchDashboard();
    const interval = setInterval(() => {
      fetchDashboard(false);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchDashboard = async (isInitialLoad = true) => {
    try {
      const statsRes = await API.get("/dashboard/stats");
      const callsRes = await API.get("/calls");
      setStats(statsRes.data);
      setCalls(callsRes.data);
      await fetchAnalytics();
    } catch (err) {
      console.log("Dashboard ERROR:", err);
    } finally {
      if (isInitialLoad) setLoading(false);
    }
  };

  const fetchAnalytics = async () => {
    try {
      const res = await API.get("/analytics/weekly-calls");
      setChartData(res.data);
    } catch (err) {
      console.log("Analytics ERROR:", err);
    }
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#208AEF" />
        <Text style={styles.loadingText}>Loading dashboard...</Text>
      </View>
    );
  }

  if (!stats) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>Failed to load dashboard</Text>
      </View>
    );
  }

  const statCards = [
    { label: "Total Calls Today", value: stats.totalCalls || 0, icon: Phone, change: "+12%", positive: true, bgColor: "#EBF5FF", iconColor: "#2563EB" },
    { label: "Active AI Agents", value: stats.activeAgents || 0, icon: Bot, change: "+2", positive: true, bgColor: "#F0FDF4", iconColor: "#16A34A" },
    { label: "Customer Satisfaction", value: stats.satisfaction || 0, icon: ThumbsUp, change: "+0.3", positive: true, bgColor: "#FAF5FF", iconColor: "#9333EA" },
    { label: "Avg Call Duration", value: stats.avgDuration || "0s", icon: Clock, change: "-5%", positive: false, bgColor: "#FFF7ED", iconColor: "#EA580C" },
  ];

  const maxCalls = Math.max(...chartData.map((d) => d.calls), 1);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.header}>
        <Text style={styles.title}>Dashboard</Text>
        <Text style={styles.subtitle}>Welcome back! Here's your overview.</Text>
      </View>

      <View style={styles.statsGrid}>
        {statCards.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <View key={i} style={styles.statCard}>
              <View style={styles.statContent}>
                <View style={{flex: 1, paddingRight: 4}}>
                  <Text style={styles.statLabel}>{stat.label}</Text>
                  <Text style={styles.statValue}>{stat.value}</Text>
                  <View style={styles.statChangeContainer}>
                    {stat.positive ? <ArrowUp size={14} color="#16A34A" /> : <ArrowDown size={14} color="#DC2626" />}
                    <Text style={[styles.statChange, { color: stat.positive ? '#16A34A' : '#DC2626' }]}>{stat.change}</Text>
                  </View>
                </View>
                <View style={[styles.iconContainer, { backgroundColor: stat.bgColor }]}>
                  <Icon size={20} color={stat.iconColor} />
                </View>
              </View>
            </View>
          );
        })}
      </View>

      <View style={styles.analyticsContainer}>
        <View style={styles.analyticsHeader}>
          <View>
            <Text style={styles.sectionTitle}>Call Analytics</Text>
            <Text style={styles.subtitle}>Weekly call volume</Text>
          </View>
          <View style={styles.liveContainer}>
            <TrendingUp size={20} color="#16A34A" />
            <Text style={styles.liveText}>Live</Text>
          </View>
        </View>

        <View style={styles.chartContainer}>
          {chartData.map((data, index) => {
            const height = (data.calls / maxCalls) * 100;
            return (
              <View key={index} style={styles.chartBarWrapper}>
                <View style={[styles.chartBar, { height: `${Math.max(height, 5)}%` }]} />
                <Text style={styles.chartLabel}>{data.day}</Text>
              </View>
            );
          })}
        </View>
      </View>

      <View style={styles.recentCallsContainer}>
        <Text style={styles.sectionTitle}>Recent Calls</Text>
        {calls.length === 0 ? (
          <Text style={styles.noDataText}>No calls found</Text>
        ) : (
          calls.map((call) => (
            <View key={call._id} style={styles.callRow}>
              <View style={styles.callDetails}>
                <Text style={styles.callerText}>{call.caller}</Text>
                <Text style={styles.agentText}>Agent: {call.agent}</Text>
              </View>
              <View style={styles.callMeta}>
                <Text style={styles.statusText}>{call.status}</Text>
                <Text style={styles.durationText}>{call.duration} | {formatDate(call.createdAt)}</Text>
              </View>
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  contentContainer: { padding: 16, paddingBottom: 40 },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 12, color: '#4B5563' },
  errorText: { color: '#EF4444', fontSize: 16 },
  header: { marginBottom: 20, paddingTop: 40 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#111827' },
  subtitle: { fontSize: 14, color: '#6B7280', marginTop: 4 },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  statCard: { width: '48%', backgroundColor: '#FFF', padding: 16, borderRadius: 12, marginBottom: 16, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2 },
  statContent: { flexDirection: 'row', justifyContent: 'space-between' },
  statLabel: { fontSize: 12, color: '#6B7280' },
  statValue: { fontSize: 20, fontWeight: 'bold', color: '#111827', marginTop: 4 },
  statChangeContainer: { flexDirection: 'row', alignItems: 'center', marginTop: 8 },
  statChange: { fontSize: 12, marginLeft: 4 },
  iconContainer: { width: 40, height: 40, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
  analyticsContainer: { backgroundColor: '#FFF', padding: 16, borderRadius: 12, marginBottom: 20, elevation: 2 },
  analyticsHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 24 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#111827', marginBottom: 12 },
  liveContainer: { flexDirection: 'row', alignItems: 'center' },
  liveText: { color: '#16A34A', fontSize: 14, fontWeight: '500', marginLeft: 4 },
  chartContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', height: 200, paddingBottom: 24 },
  chartBarWrapper: { alignItems: 'center', flex: 1 },
  chartBar: { width: 20, backgroundColor: '#3B82F6', borderTopLeftRadius: 4, borderTopRightRadius: 4 },
  chartLabel: { fontSize: 10, color: '#6B7280', marginTop: 8, position: 'absolute', bottom: -20 },
  recentCallsContainer: { backgroundColor: '#FFF', padding: 16, borderRadius: 12, elevation: 2 },
  noDataText: { textAlign: 'center', color: '#6B7280', marginVertical: 16 },
  callRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  callDetails: { flex: 1 },
  callerText: { fontSize: 14, fontWeight: '600', color: '#111827' },
  agentText: { fontSize: 12, color: '#6B7280', marginTop: 2 },
  callMeta: { alignItems: 'flex-end' },
  statusText: { fontSize: 12, fontWeight: '500', color: '#374151' },
  durationText: { fontSize: 10, color: '#9CA3AF', marginTop: 4 }
});
