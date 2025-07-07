import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, TextInput, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Plus, Search, Users, Clock, Calendar, MoveVertical as MoreVertical } from 'lucide-react-native';
import { useAuthContext } from '@/components/AuthProvider';
import { useClasses } from '@/hooks/useClasses';

const classColors = ['#6C63FF', '#FFAA00', '#10B981', '#EF4444', '#8B5CF6', '#F59E0B'];

export default function ClassesScreen() {
  const { profile } = useAuthContext();
  const { classes, isLoading, createClass } = useClasses(profile?.id);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    subject: '',
    grade: '',
    description: '',
    schedule: '',
  });

  const filteredClasses = classes?.filter(cls =>
    cls.name.toLowerCase().includes(searchText.toLowerCase()) ||
    cls.subject.toLowerCase().includes(searchText.toLowerCase())
  ) || [];

  const handleCreateClass = async () => {
    if (!formData.name || !formData.subject || !formData.grade || !profile?.id) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    try {
      await createClass.mutateAsync({
        name: formData.name,
        subject: formData.subject,
        grade: formData.grade,
        description: formData.description,
        schedule: formData.schedule,
        teacher_id: profile.id,
        color: classColors[Math.floor(Math.random() * classColors.length)],
      });

      setShowCreateModal(false);
      setFormData({
        name: '',
        subject: '',
        grade: '',
        description: '',
        schedule: '',
      });
      Alert.alert('Success', 'Class created successfully!');
    } catch (error) {
      Alert.alert('Error', 'Failed to create class. Please try again.');
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading classes...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Classes</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setShowCreateModal(true)}
        >
          <Plus size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Search size={20} color="#6B7280" />
        <TextInput
          style={styles.searchInput}
          placeholder="Search classes..."
          value={searchText}
          onChangeText={setSearchText}
          placeholderTextColor="#9CA3AF"
        />
      </View>

      {/* Class List */}
      <ScrollView style={styles.classListContainer} showsVerticalScrollIndicator={false}>
        {filteredClasses.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No classes found</Text>
            <Text style={styles.emptySubtext}>Create your first class to get started</Text>
          </View>
        ) : (
          filteredClasses.map((cls) => (
            <View key={cls.id} style={styles.classCard}>
              <View style={styles.classHeader}>
                <View style={[styles.classColorBar, { backgroundColor: cls.color }]} />
                <View style={styles.classInfo}>
                  <Text style={styles.className}>{cls.name}</Text>
                  <Text style={styles.classGrade}>Grade {cls.grade}</Text>
                </View>
                <TouchableOpacity style={styles.moreButton}>
                  <MoreVertical size={20} color="#6B7280" />
                </TouchableOpacity>
              </View>

              <View style={styles.classDetails}>
                <View style={styles.classDetailItem}>
                  <Users size={16} color="#6B7280" />
                  <Text style={styles.classDetailText}>0 students</Text>
                </View>
                {cls.schedule && (
                  <View style={styles.classDetailItem}>
                    <Clock size={16} color="#6B7280" />
                    <Text style={styles.classDetailText}>{cls.schedule}</Text>
                  </View>
                )}
                <View style={styles.classDetailItem}>
                  <Calendar size={16} color="#6B7280" />
                  <Text style={styles.classDetailText}>
                    Created {new Date(cls.created_at).toLocaleDateString()}
                  </Text>
                </View>
              </View>

              <View style={styles.classActions}>
                <TouchableOpacity style={[styles.actionButton, styles.secondaryButton]}>
                  <Text style={styles.secondaryButtonText}>View Details</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.actionButton, styles.primaryButton]}>
                  <Text style={styles.primaryButtonText}>Start Class</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
      </ScrollView>

      {/* Create Class Modal */}
      <Modal
        visible={showCreateModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowCreateModal(false)}>
              <Text style={styles.cancelButton}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Create New Class</Text>
            <TouchableOpacity onPress={handleCreateClass}>
              <Text style={styles.saveButton}>Save</Text>
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.modalContent}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Class Name *</Text>
              <TextInput
                style={styles.textInput}
                placeholder="e.g., Mathematics - Grade 10"
                placeholderTextColor="#9CA3AF"
                value={formData.name}
                onChangeText={(text) => setFormData({ ...formData, name: text })}
              />
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Subject *</Text>
              <TextInput
                style={styles.textInput}
                placeholder="e.g., Mathematics"
                placeholderTextColor="#9CA3AF"
                value={formData.subject}
                onChangeText={(text) => setFormData({ ...formData, subject: text })}
              />
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Grade *</Text>
              <TextInput
                style={styles.textInput}
                placeholder="e.g., 10"
                placeholderTextColor="#9CA3AF"
                value={formData.grade}
                onChangeText={(text) => setFormData({ ...formData, grade: text })}
              />
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Schedule</Text>
              <TextInput
                style={styles.textInput}
                placeholder="e.g., Mon, Wed, Fri - 4:00 PM"
                placeholderTextColor="#9CA3AF"
                value={formData.schedule}
                onChangeText={(text) => setFormData({ ...formData, schedule: text })}
              />
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Description</Text>
              <TextInput
                style={[styles.textInput, styles.textArea]}
                placeholder="Class description..."
                placeholderTextColor="#9CA3AF"
                multiline
                numberOfLines={4}
                value={formData.description}
                onChangeText={(text) => setFormData({ ...formData, description: text })}
              />
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#6B7280',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 10,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#6C63FF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginHorizontal: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: '#1F2937',
  },
  classListContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
  classCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  classHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  classColorBar: {
    width: 4,
    height: 40,
    borderRadius: 2,
    marginRight: 16,
  },
  classInfo: {
    flex: 1,
  },
  className: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  classGrade: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
  moreButton: {
    padding: 8,
  },
  classDetails: {
    marginBottom: 20,
  },
  classDetailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  classDetailText: {
    fontSize: 14,
    color: '#6B7280',
    marginLeft: 8,
  },
  classActions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  secondaryButton: {
    backgroundColor: '#F3F4F6',
  },
  primaryButton: {
    backgroundColor: '#6C63FF',
  },
  secondaryButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  primaryButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  cancelButton: {
    fontSize: 16,
    color: '#6B7280',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  saveButton: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6C63FF',
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#1F2937',
    backgroundColor: '#FFFFFF',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
});