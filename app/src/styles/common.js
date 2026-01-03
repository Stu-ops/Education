// Common styles shared across components
import { StyleSheet, Platform } from 'react-native';
import colors from './colors';

export const commonStyles = StyleSheet.create({
  // Containers
  container: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  safeArea: {
    flex: 1,
  },

  // Cards
  card: {
    backgroundColor: colors.glass.background,
    borderRadius: 16,
    padding: 16,
    marginVertical: 8,
  },
  cardLarge: {
    backgroundColor: colors.glass.background,
    borderRadius: 20,
    padding: 20,
    marginVertical: 10,
  },
  glassCard: {
    backgroundColor: colors.glass.background,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.glass.border,
  },

  // Buttons
  button: {
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  buttonSmall: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 40,
  },
  buttonText: {
    color: colors.text.primary,
    fontSize: 16,
    fontWeight: '600',
  },
  buttonTextSmall: {
    color: colors.text.primary,
    fontSize: 14,
    fontWeight: '600',
  },

  // Inputs
  input: {
    backgroundColor: colors.glass.backgroundLight,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    color: colors.text.primary,
    fontSize: 16,
    minHeight: 48,
  },
  inputFocused: {
    borderWidth: 2,
    borderColor: colors.primary.blue,
  },

  // Text styles
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.text.primary,
  },
  subtitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text.primary,
  },
  heading: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text.primary,
  },
  body: {
    fontSize: 16,
    color: colors.text.primary,
  },
  bodySmall: {
    fontSize: 14,
    color: colors.text.secondary,
  },
  caption: {
    fontSize: 12,
    color: colors.text.muted,
  },

  // Shadows
  shadow: {
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  shadowLight: {
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },

  // Flex utilities
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rowBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  rowCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Avatar
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarLarge: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Loading
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default commonStyles;
