import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Plus, Calendar, Users, BookOpen, TrendingUp, Bell, Clock, CircleCheck as CheckCircle } from 'lucide-react-native';
import { useAuthContext } from '@/components/AuthProvider';
import { useClasses } from '@/hooks/useClasses';
import { useStudents } from '@/hooks/useStudents';
import { useAttendanceStats } from '@/hooks/useAttendance';
import { useNotifications } from '@/hooks/useNotifications';

export default function HomeScreen() {
  const { profile, signOut } = useAuthContext();
  const { classes, isLoading: classesLoading } = useClasses(profile?.id);
  const { students, isLoading: studentsLoading } = useStudents(profile?.id);
  const { stats: attendanceStats } = useAttendanceStats(profile?.id);
  const { notifications, unreadCount } = useNotifications(profile?.id);

  const totalClasses = classes?.length || 0;
  const totalStudents = students?.length || 0;
  const activeClasses = classes?.filter(c => c.is_active)?.length || 0;
  const attendancePercentage = attendanceStats?.presentPercentage || 0;

  const statsData = [
    { label: 'Total Classes', value: totalClasses.toString(), icon: BookOpen, color: '#6C63FF' },
    { label: 'Active Students', value: totalStudents.toString(), icon: Users, color: '#FFAA00' },
    { label: 'Active Classes', value: activeClasses.toString(), icon: TrendingUp, color: '#10B981' },
    { label: 'Attendance', value: `${attendancePercentage}%`, icon: CheckCircle, color: '#EF4444' },
  ];

  const quickActions = [
    { title: 'Create Class', icon: Plus, color: '#6C63FF' },
    { title: 'Mark Attendance', icon: CheckCircle, color: '#10B981' },
    { title: 'Add Resource', icon: BookOpen, color: '#FFAA00' },
    { title: 'Create Test', icon: Calendar, color: '#EF4444' },
  ];

  // Get recent activity from notifications and classes
  const recentActivity = [
    ...(notifications?.slice(0, 3).map(notification => ({
      title: notification.title,
      subtitle: notification.message,
      time: new Date(notification.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      type: 'notification' as const,
    })) || []),
    ...(classes?.slice(0, 2).map(cls => ({
      title: `${cls.name} - ${cls.subject}`,
      subtitle: `Grade ${cls.grade} • ${cls.schedule || 'No schedule set'}`,
      time: new Date(cls.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      type: 'class' as const,
    })) || []),
  ].slice(0, 5);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Namaste! 🙏</Text>
            <Text style={styles.welcomeText}>
              Welcome back, {profile?.full_name || 'Teacher'}
            </Text>
          </View>
          <TouchableOpacity style={styles.notificationBtn} onPress={signOut}>
            <Bell size={20} color="#6C63FF" />
            {unreadCount > 0 && (
              <View style={styles.notificationBadge}>
                <Text style={styles.notificationBadgeText}>
                  {unreadCount > 9 ? '9+' : unreadCount}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          {statsData.map((stat, index) => (
            <View key={index} style={styles.statCard}>
              <View style={[styles.statIcon, { backgroundColor: stat.color + '15' }]}>
                <stat.icon size={24} color={stat.color} />
              </View>
              <Text style={styles.statValue}>{stat.value}</Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
            </View>
          ))}
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActionsContainer}>
            {quickActions.map((action, index) => (
              <TouchableOpacity key={index} style={styles.quickActionCard}>
                <View style={[styles.quickActionIcon, { backgroundColor: action.color + '15' }]}>
                  <action.icon size={20} color={action.color} />
                </View>
                <Text style={styles.quickActionTitle}>{action.title}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Recent Activity */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Activity</Text>
          <View style={styles.activityContainer}>
            {recentActivity.length === 0 ? (
              <View style={styles.emptyActivity}>
                <Clock size={48} color="#9CA3AF" />
                <Text style={styles.emptyActivityText}>No recent activity</Text>
                <Text style={styles.emptyActivitySubtext}>
                  Your recent classes and notifications will appear here
                </Text>
              </View>
            ) : (
              recentActivity.map((activity, index) => (
                <View key={index} style={styles.activityItem}>
                  <View style={[
                    styles.activityDot,
                    { backgroundColor: activity.type === 'notification' ? '#FFAA00' : '#6C63FF' }
                  ]} />
                  <View style={styles.activityContent}>
                    <Text style={styles.activityTitle}>{activity.title}</Text>
                    <Text style={styles.activitySubtitle}>{activity.subtitle}</Text>
                  </View>
                  <Text style={styles.activityTime}>{activity.time}</Text>
                </View>
              ))
            )}
          </View>
        </View>

        {/* Today's Schedule */}
        {classes && classes.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Today's Classes</Text>
            <View style={styles.scheduleContainer}>
              {classes.slice(0, 3).map((cls) => (
                <View key={cls.id} style={styles.scheduleItem}>
                  <View style={[styles.scheduleColorBar, { backgroundColor: cls.color }]} />
                  <View style={styles.scheduleContent}>
                    <Text style={styles.scheduleTitle}>{cls.name}</Text>
                    <Text style={styles.scheduleSubtitle}>
                      {cls.subject} • Grade {cls.grade}
                    </Text>
                    <Text style={styles.scheduleTime}>
                      {cls.schedule || 'No schedule set'}
                    </Text>
                  </View>
                  <TouchableOpacity style={styles.scheduleAction}>
                    <Text style={styles.scheduleActionText}>Start</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 10,
  },
  greeting: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
  },
  welcomeText: {
    fontSize: 16,
    color: '#6B7280',
    marginTop: 2,
  },
  notificationBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    position: 'relative',
  },
  notificationBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: '#EF4444',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  notificationBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '600',
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 20,
    gap: 12,
  },
  statCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    flex: 1,
    minWidth: '45%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
  section: {
    marginTop: 32,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 16,
  },
  quickActionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  quickActionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    flex: 1,
    minWidth: '45%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  quickActionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  quickActionTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1F2937',
    textAlign: 'center',
  },
  activityContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  emptyActivity: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyActivityText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginTop: 12,
  },
  emptyActivitySubtext: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 4,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  activityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 12,
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  activitySubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
  activityTime: {
    fontSize: 12,
    color: '#9CA3AF',
    marginLeft: 8,
  },
  scheduleContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  scheduleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  scheduleColorBar: {
    width: 4,
    height: 40,
    borderRadius: 2,
    marginRight: 12,
  },
  scheduleContent: {
    flex: 1,
  },
  scheduleTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  scheduleSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
  scheduleTime: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 2,
  },
  scheduleAction: {
    backgroundColor: '#6C63FF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  scheduleActionText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
});