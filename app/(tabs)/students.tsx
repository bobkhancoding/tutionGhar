import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, TextInput, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Plus, Search, Phone, Mail, GraduationCap, MoveVertical as MoreVertical, MessageCircle, Eye, UserPlus } from 'lucide-react-native';
import { useAuthContext } from '@/components/AuthProvider';
import { useStudents } from '@/hooks/useStudents';
import { useClasses } from '@/hooks/useClasses';

export default function StudentsScreen() {
  const { profile } = useAuthContext();
  const { students, isLoading, updateStudent } = useStudents(profile?.id);
  const { classes } = useClasses(profile?.id);
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [showStudentModal, setShowStudentModal] = useState(false);

  const filteredStudents = students?.filter(student =>
    student.full_name.toLowerCase().includes(searchText.toLowerCase()) ||
    student.email.toLowerCase().includes(searchText.toLowerCase()) ||
    (student.phone && student.phone.includes(searchText))
  ) || [];

  const handleViewStudent = (student: any) => {
    setSelectedStudent(student);
    setShowStudentModal(true);
  };

  const handleUpdateStudent = async (studentId: string, updates: any) => {
    try {
      await updateStudent.mutateAsync({ id: studentId, updates });
      Alert.alert('Success', 'Student updated successfully!');
      setShowStudentModal(false);
    } catch (error) {
      Alert.alert('Error', 'Failed to update student. Please try again.');
    }
  };

  const getStudentClasses = (studentId: string) => {
    // This would need to be implemented with proper class_students relationship
    return classes?.filter(cls => 
      // For now, we'll show all classes since we don't have the relationship data
      true
    ).slice(0, 2) || [];
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading students...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Students</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setShowAddModal(true)}
        >
          <Plus size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Search size={20} color="#6B7280" />
        <TextInput
          style={styles.searchInput}
          placeholder="Search students..."
          value={searchText}
          onChangeText={setSearchText}
          placeholderTextColor="#9CA3AF"
        />
      </View>

      {/* Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{students?.length || 0}</Text>
          <Text style={styles.statLabel}>Total Students</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{students?.length || 0}</Text>
          <Text style={styles.statLabel}>Active</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>0</Text>
          <Text style={styles.statLabel}>Inactive</Text>
        </View>
      </View>

      {/* Students List */}
      <ScrollView style={styles.studentsContainer} showsVerticalScrollIndicator={false}>
        {filteredStudents.length === 0 ? (
          <View style={styles.emptyContainer}>
            <UserPlus size={64} color="#9CA3AF" />
            <Text style={styles.emptyText}>No students found</Text>
            <Text style={styles.emptySubtext}>Students will appear here when they join your classes</Text>
          </View>
        ) : (
          filteredStudents.map((student) => {
            const studentClasses = getStudentClasses(student.id);
            return (
              <View key={student.id} style={styles.studentCard}>
                <View style={styles.studentHeader}>
                  <View style={styles.studentAvatar}>
                    <Text style={styles.studentInitials}>
                      {student.full_name.split(' ').map(n => n[0]).join('')}
                    </Text>
                  </View>
                  <View style={styles.studentInfo}>
                    <Text style={styles.studentName}>{student.full_name}</Text>
                    <View style={styles.studentStatus}>
                      <View style={[styles.statusDot, { backgroundColor: '#10B981' }]} />
                      <Text style={[styles.statusText, { color: '#10B981' }]}>
                        Active
                      </Text>
                    </View>
                    {studentClasses.length > 0 && (
                      <Text style={styles.studentClasses}>
                        {studentClasses.map(cls => cls.subject).join(', ')}
                      </Text>
                    )}
                  </View>
                  <TouchableOpacity 
                    style={styles.moreButton}
                    onPress={() => handleViewStudent(student)}
                  >
                    <Eye size={20} color="#6B7280" />
                  </TouchableOpacity>
                </View>

                <View style={styles.studentDetails}>
                  <View style={styles.studentDetailItem}>
                    <Mail size={16} color="#6B7280" />
                    <Text style={styles.studentDetailText}>{student.email}</Text>
                  </View>
                  {student.phone && (
                    <View style={styles.studentDetailItem}>
                      <Phone size={16} color="#6B7280" />
                      <Text style={styles.studentDetailText}>{student.phone}</Text>
                    </View>
                  )}
                  <View style={styles.studentDetailItem}>
                    <GraduationCap size={16} color="#6B7280" />
                    <Text style={styles.studentDetailText}>
                      {studentClasses.length} {studentClasses.length === 1 ? 'class' : 'classes'}
                    </Text>
                  </View>
                </View>

                <View style={styles.studentActions}>
                  <TouchableOpacity style={[styles.actionButton, styles.secondaryButton]}>
                    <Eye size={16} color="#374151" />
                    <Text style={styles.secondaryButtonText}>View Profile</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.actionButton, styles.primaryButton]}>
                    <MessageCircle size={16} color="#FFFFFF" />
                    <Text style={styles.primaryButtonText}>Message</Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          })
        )}
      </ScrollView>

      {/* Add Student Modal */}
      <Modal
        visible={showAddModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowAddModal(false)}>
              <Text style={styles.cancelButton}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Add New Student</Text>
            <TouchableOpacity>
              <Text style={styles.saveButton}>Save</Text>
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.modalContent}>
            <View style={styles.infoCard}>
              <UserPlus size={48} color="#6C63FF" />
              <Text style={styles.infoTitle}>How to Add Students</Text>
              <Text style={styles.infoText}>
                Students can join your classes by:
              </Text>
              <View style={styles.infoSteps}>
                <Text style={styles.infoStep}>1. Creating an account with their email</Text>
                <Text style={styles.infoStep}>2. Searching for your classes</Text>
                <Text style={styles.infoStep}>3. Requesting to join your class</Text>
                <Text style={styles.infoStep}>4. You can then approve their enrollment</Text>
              </View>
              <Text style={styles.infoNote}>
                You can also share your class codes with students for quick enrollment.
              </Text>
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* Student Detail Modal */}
      <Modal
        visible={showStudentModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowStudentModal(false)}>
              <Text style={styles.cancelButton}>Close</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Student Details</Text>
            <TouchableOpacity>
              <Text style={styles.saveButton}>Edit</Text>
            </TouchableOpacity>
          </View>
          {selectedStudent && (
            <ScrollView style={styles.modalContent}>
              <View style={styles.studentDetailCard}>
                <View style={styles.studentDetailAvatar}>
                  <Text style={styles.studentDetailInitials}>
                    {selectedStudent.full_name.split(' ').map((n: string) => n[0]).join('')}
                  </Text>
                </View>
                <Text style={styles.studentDetailName}>{selectedStudent.full_name}</Text>
                <Text style={styles.studentDetailRole}>{selectedStudent.role}</Text>
                
                <View style={styles.studentDetailInfo}>
                  <View style={styles.studentDetailItem}>
                    <Mail size={20} color="#6B7280" />
                    <Text style={styles.studentDetailText}>{selectedStudent.email}</Text>
                  </View>
                  {selectedStudent.phone && (
                    <View style={styles.studentDetailItem}>
                      <Phone size={20} color="#6B7280" />
                      <Text style={styles.studentDetailText}>{selectedStudent.phone}</Text>
                    </View>
                  )}
                  {selectedStudent.institute_name && (
                    <View style={styles.studentDetailItem}>
                      <GraduationCap size={20} color="#6B7280" />
                      <Text style={styles.studentDetailText}>{selectedStudent.institute_name}</Text>
                    </View>
                  )}
                </View>

                <View style={styles.enrolledClasses}>
                  <Text style={styles.enrolledClassesTitle}>Enrolled Classes</Text>
                  {getStudentClasses(selectedStudent.id).map((cls) => (
                    <View key={cls.id} style={styles.enrolledClassItem}>
                      <View style={[styles.classColorDot, { backgroundColor: cls.color }]} />
                      <View style={styles.enrolledClassInfo}>
                        <Text style={styles.enrolledClassName}>{cls.name}</Text>
                        <Text style={styles.enrolledClassSubject}>{cls.subject} • Grade {cls.grade}</Text>
                      </View>
                    </View>
                  ))}
                  {getStudentClasses(selectedStudent.id).length === 0 && (
                    <Text style={styles.noClasses}>Not enrolled in any classes yet</Text>
                  )}
                </View>
              </View>
            </ScrollView>
          )}
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
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 20,
    gap: 12,
  },
  statItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    flex: 1,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
  },
  studentsContainer: {
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
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
  studentCard: {
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
  studentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  studentAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#6C63FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  studentInitials: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  studentInfo: {
    flex: 1,
  },
  studentName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  studentStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  studentClasses: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 2,
  },
  moreButton: {
    padding: 8,
  },
  studentDetails: {
    marginBottom: 16,
  },
  studentDetailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  studentDetailText: {
    fontSize: 14,
    color: '#6B7280',
    marginLeft: 8,
  },
  studentActions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
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
  infoCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
  },
  infoTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1F2937',
    marginTop: 16,
    marginBottom: 8,
  },
  infoText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 16,
  },
  infoSteps: {
    alignSelf: 'stretch',
    marginBottom: 16,
  },
  infoStep: {
    fontSize: 14,
    color: '#374151',
    marginBottom: 8,
    paddingLeft: 8,
  },
  infoNote: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  studentDetailCard: {
    alignItems: 'center',
  },
  studentDetailAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#6C63FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  studentDetailInitials: {
    fontSize: 32,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  studentDetailName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 4,
  },
  studentDetailRole: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 24,
    textTransform: 'capitalize',
  },
  studentDetailInfo: {
    alignSelf: 'stretch',
    marginBottom: 24,
  },
  enrolledClasses: {
    alignSelf: 'stretch',
  },
  enrolledClassesTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 16,
  },
  enrolledClassItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  classColorDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
  },
  enrolledClassInfo: {
    flex: 1,
  },
  enrolledClassName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  enrolledClassSubject: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
  noClasses: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
    fontStyle: 'italic',
  },
});