import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, FlatList, Platform } from 'react-native';
import { Upload, FileText, Check, Clock, Trash2, Download, AlertCircle } from 'lucide-react-native';
import API from '../services/api';

export default function Documents() {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDocs();
  }, []);

  useEffect(() => {
    const hasProcessing = documents.some((doc) => doc.status === "processing");
    let intervalId;
    if (hasProcessing) {
      intervalId = setInterval(() => {
        fetchDocs();
      }, 3000);
    }
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [documents]);

  const fetchDocs = async () => {
    try {
      const res = await API.get("/documents");
      setDocuments(res.data);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUploadClick = () => {
    // In a real native app, use expo-document-picker
    alert("Upload functionality requires expo-document-picker on mobile.");
  };

  const handleDelete = async (id) => {
    try {
      await API.delete(`/documents/${id}`);
      setDocuments(documents.filter((d) => d._id !== id));
    } catch (err) {
      console.log(err);
    }
  };

  const handleDownload = async (id, fileName) => {
    // On mobile, downloading files requires expo-file-system or Linking to the URL
    alert("Download started for " + fileName);
  };

  const renderDoc = ({ item }) => (
    <View style={styles.docCard}>
      <View style={styles.docHeader}>
        <View style={styles.docInfo}>
          <View style={styles.iconWrapper}>
            <FileText size={24} color="#2563EB" />
          </View>
          <View style={styles.docMeta}>
            <Text style={styles.docName}>{item.fileName}</Text>
            <View style={styles.docSubMeta}>
              <Text style={styles.docSize}>{item.size || 'Unknown size'}</Text>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.docDate}>
                Uploaded {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : 'N/A'}
              </Text>
            </View>
          </View>
        </View>
      </View>
      
      <View style={styles.docFooter}>
        <View style={[
          styles.statusBadge, 
          item.status === 'vectorized' ? styles.badgeSuccess : 
          item.status === 'failed' ? styles.badgeError : styles.badgeWarning
        ]}>
          {item.status === 'vectorized' ? <Check size={12} color="#15803D" /> :
           item.status === 'failed' ? <AlertCircle size={12} color="#B91C1C" /> :
           <Clock size={12} color="#C2410C" />}
          <Text style={[
            styles.statusText,
            item.status === 'vectorized' ? styles.textSuccess : 
            item.status === 'failed' ? styles.textError : styles.textWarning
          ]}>
            {item.status === 'vectorized' ? 'Vectorized' : 
             item.status === 'failed' ? 'Failed' : 'Processing'}
          </Text>
        </View>

        <View style={styles.actions}>
          <TouchableOpacity style={styles.actionBtn} onPress={() => handleDownload(item._id, item.fileName)}>
            <Download size={18} color="#4B5563" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionBtnDelete} onPress={() => handleDelete(item._id)}>
            <Trash2 size={18} color="#DC2626" />
          </TouchableOpacity>
        </View>
      </View>

      {item.status === 'processing' && (
        <View style={styles.progressContainer}>
          <View style={styles.progressBarBg}>
            <View style={styles.progressBarFill} />
          </View>
          <Text style={styles.progressText}>Processing document and generating embeddings...</Text>
        </View>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Documents</Text>
        <Text style={styles.subtitle}>Upload and manage knowledge base documents</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <TouchableOpacity style={styles.uploadBox} onPress={handleUploadClick}>
          <View style={styles.uploadIconWrap}>
            <Upload size={32} color="#2563EB" />
          </View>
          <Text style={styles.uploadTitle}>Upload Documents</Text>
          <Text style={styles.uploadSubtitle}>Tap to select files</Text>
          <View style={styles.uploadBtn}>
            <Text style={styles.uploadBtnText}>Select Files</Text>
          </View>
          <Text style={styles.uploadHelp}>Supported formats: PDF, DOCX, TXT (Max 10MB)</Text>
        </TouchableOpacity>

        <View style={styles.listSection}>
          <Text style={styles.sectionTitle}>Uploaded Documents</Text>
          {loading ? (
            <ActivityIndicator size="large" color="#2563EB" style={{margin: 20}} />
          ) : (
            <FlatList
              data={documents}
              keyExtractor={(item) => item._id || Math.random().toString()}
              renderItem={renderDoc}
              scrollEnabled={false}
              ListEmptyComponent={<Text style={styles.emptyText}>No documents found.</Text>}
            />
          )}
        </View>

        <View style={styles.infoBox}>
          <Text style={styles.infoTitle}>How Document Processing Works</Text>
          <Text style={styles.infoText}>• Documents are vectorized for AI retrieval</Text>
          <Text style={styles.infoText}>• Agents use them during calls</Text>
          <Text style={styles.infoText}>• Takes ~1-3 minutes</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  header: { padding: 16, paddingTop: 40, backgroundColor: '#FFF', borderBottomWidth: 1, borderBottomColor: '#E5E7EB' },
  title: { fontSize: 24, fontWeight: 'bold', color: '#111827' },
  subtitle: { fontSize: 14, color: '#6B7280', marginTop: 4 },
  scrollContent: { padding: 16 },
  uploadBox: { backgroundColor: '#FFF', borderRadius: 16, padding: 24, alignItems: 'center', borderWidth: 2, borderColor: '#D1D5DB', borderStyle: 'dashed', marginBottom: 24 },
  uploadIconWrap: { width: 64, height: 64, borderRadius: 32, backgroundColor: '#EFF6FF', justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  uploadTitle: { fontSize: 18, fontWeight: 'bold', color: '#111827', marginBottom: 8 },
  uploadSubtitle: { fontSize: 14, color: '#4B5563', marginBottom: 16 },
  uploadBtn: { backgroundColor: '#2563EB', paddingHorizontal: 24, paddingVertical: 10, borderRadius: 8, marginBottom: 16 },
  uploadBtnText: { color: '#FFF', fontWeight: 'bold' },
  uploadHelp: { fontSize: 12, color: '#6B7280' },
  listSection: { backgroundColor: '#FFF', borderRadius: 16, overflow: 'hidden', borderWidth: 1, borderColor: '#E5E7EB', marginBottom: 24 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#111827', padding: 16, borderBottomWidth: 1, borderBottomColor: '#E5E7EB' },
  emptyText: { textAlign: 'center', color: '#6B7280', padding: 24 },
  docCard: { padding: 16, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  docHeader: { marginBottom: 12 },
  docInfo: { flexDirection: 'row', alignItems: 'center' },
  iconWrapper: { width: 48, height: 48, borderRadius: 12, backgroundColor: '#EFF6FF', justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  docMeta: { flex: 1 },
  docName: { fontSize: 16, fontWeight: 'bold', color: '#111827' },
  docSubMeta: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  docSize: { fontSize: 12, color: '#6B7280' },
  bullet: { fontSize: 12, color: '#9CA3AF', marginHorizontal: 6 },
  docDate: { fontSize: 12, color: '#6B7280' },
  docFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  statusBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 16 },
  badgeSuccess: { backgroundColor: '#DCFCE7' },
  badgeError: { backgroundColor: '#FEE2E2' },
  badgeWarning: { backgroundColor: '#FFEDD5' },
  textSuccess: { fontSize: 12, fontWeight: '600', color: '#15803D', marginLeft: 6 },
  textError: { fontSize: 12, fontWeight: '600', color: '#B91C1C', marginLeft: 6 },
  textWarning: { fontSize: 12, fontWeight: '600', color: '#C2410C', marginLeft: 6 },
  actions: { flexDirection: 'row' },
  actionBtn: { padding: 8, marginLeft: 8, backgroundColor: '#F3F4F6', borderRadius: 8 },
  actionBtnDelete: { padding: 8, marginLeft: 8, backgroundColor: '#FEF2F2', borderRadius: 8 },
  progressContainer: { marginTop: 16 },
  progressBarBg: { width: '100%', height: 8, backgroundColor: '#E5E7EB', borderRadius: 4, overflow: 'hidden' },
  progressBarFill: { width: '66%', height: '100%', backgroundColor: '#F97316' },
  progressText: { fontSize: 10, color: '#6B7280', marginTop: 8 },
  infoBox: { backgroundColor: '#EFF6FF', borderWidth: 1, borderColor: '#BFDBFE', borderRadius: 12, padding: 16, marginBottom: 40 },
  infoTitle: { fontSize: 14, fontWeight: 'bold', color: '#1E3A8A', marginBottom: 8 },
  infoText: { fontSize: 12, color: '#1E40AF', marginBottom: 4 }
});
