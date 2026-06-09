import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  Pressable,
  Image,
  ScrollView,
  StyleSheet,
  Platform,
  Share,
  Linking,
  Alert,
} from 'react-native';
import Animated, {
  SlideInDown,
  SlideOutDown,
  FadeIn,
  FadeOut,
} from 'react-native-reanimated';
import {
  X,
  Copy,
  Check,
  ExternalLink,
  Trash2,
  FolderSync,
  Share2,
  ZoomIn,
  ZoomOut,
  ChevronUp,
  ChevronDown,
} from 'lucide-react-native';
import * as Clipboard from 'expo-clipboard';
import { StashItem, CategoryKey } from '../types';
import { colors, fonts, radii } from '../theme/colors';

interface FocusInspectorProps {
  item: StashItem | null;
  visible: boolean;
  onClose: () => void;
  onDelete: (id: string) => void;
  onRegroup: (id: string, newCategory: CategoryKey) => void;
}

const CATEGORIES: CategoryKey[] = [
  'Shopping',
  'Recipes',
  'Travel',
  'Articles',
  'Design',
];

export function FocusInspector({
  item,
  visible,
  onClose,
  onDelete,
  onRegroup,
}: FocusInspectorProps) {
  const [isZoomed, setIsZoomed] = useState(false);
  const [isOcrOpen, setIsOcrOpen] = useState(true);
  const [copied, setCopied] = useState(false);
  const [showRegroupMenu, setShowRegroupMenu] = useState(false);

  if (!item) return null;

  const handleCopy = async () => {
    try {
      await Clipboard.setStringAsync(item.extractedText || '');
    } catch {}
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async () => {
    try {
      await Share.share({
        title: item.title,
        message:
          (item.description ? item.description + '\n' : '') +
          (item.sourceUrl || ''),
      });
    } catch {
      Alert.alert('Share', `Link for "${item.title}" would be shared.`);
    }
  };

  const formattedDate = new Date(item.createdAt).toLocaleDateString(
    undefined,
    { day: 'numeric', month: 'short' },
  );

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View style={styles.backdrop}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />

        <Animated.View
          entering={SlideInDown.springify().damping(22).stiffness(220)}
          exiting={SlideOutDown.duration(180)}
          style={styles.sheet}
        >
          <View style={styles.sheetPanel}>
            {/* Header */}
            <View style={styles.header}>
              <View style={styles.headerLeft}>
                <Text style={styles.title} numberOfLines={2}>
                  {item.title}
                </Text>
                <Text style={styles.sub}>
                  VAULT · {item.category.toUpperCase()} · {formattedDate}
                </Text>
              </View>
              <Pressable
                onPress={onClose}
                style={({ pressed }) => [
                  styles.closeBtn,
                  pressed && { opacity: 0.7 },
                ]}
              >
                <Text style={styles.closeBtnText}>CLOSE</Text>
              </Pressable>
            </View>

            <ScrollView
              contentContainerStyle={styles.scroll}
              showsVerticalScrollIndicator={false}
            >
              {/* Hero image */}
              <View style={styles.heroWrap}>
                <Image
                  source={{ uri: item.imageUrl }}
                  style={[
                    styles.heroImg,
                    isZoomed && { transform: [{ scale: 1.5 }] },
                  ]}
                  resizeMode="cover"
                />
                <View style={styles.heroOverlay} />
                <Pressable
                  onPress={() => setIsZoomed(!isZoomed)}
                  style={({ pressed }) => [
                    styles.zoomBtn,
                    pressed && { opacity: 0.85 },
                  ]}
                >
                  {isZoomed ? (
                    <ZoomOut
                      color={colors.textPrimary}
                      size={10}
                      strokeWidth={2.4}
                    />
                  ) : (
                    <ZoomIn
                      color={colors.textPrimary}
                      size={10}
                      strokeWidth={2.4}
                    />
                  )}
                  <Text style={styles.zoomText}>
                    {isZoomed ? 'ZOOM OUT' : 'PINCH TO ZOOM'}
                  </Text>
                </Pressable>
              </View>

              {/* Description Section */}
              {item.description && (
                <View style={{ gap: 6, marginTop: 18 }}>
                  <Text style={styles.label}>
                    ABOUT THIS IMAGE
                  </Text>
                  <View style={styles.descPanel}>
                    <Text style={styles.descText}>
                      {item.description}
                    </Text>
                  </View>
                </View>
              )}

              {/* Source URL pill */}
              {item.sourceUrl && (
                <View style={{ gap: 6, marginTop: 18 }}>
                  <Text style={styles.label}>
                    ORIGINAL WEBSITE LINK
                  </Text>
                  <Pressable
                    onPress={() => Linking.openURL(item.sourceUrl!)}
                    style={({ pressed }) => [
                      styles.sourcePill,
                      pressed && { opacity: 0.85 },
                    ]}
                  >
                    <View style={styles.sourceIconBox}>
                      <Image
                        source={{
                          uri:
                            item.favicon ||
                            `https://www.google.com/s2/favicons?sz=64&domain=${
                              item.sourceUrl
                                .replace(/^https?:\/\//i, '')
                                .split('/')[0]
                            }`,
                        }}
                        style={styles.favicon}
                        resizeMode="contain"
                      />
                    </View>
                    <Text
                      style={styles.sourceText}
                      numberOfLines={1}
                    >
                      {item.sourceUrl.replace(
                        /^https?:\/\/(www\.)?/i,
                        '',
                      )}
                    </Text>
                    <ExternalLink
                      color={colors.textSecondary}
                      size={11}
                      strokeWidth={2}
                    />
                  </Pressable>
                </View>
              )}

              {/* OCR Accordion */}
              <View style={{ gap: 8, marginTop: 18 }}>
                <Pressable
                  onPress={() => setIsOcrOpen(!isOcrOpen)}
                  style={styles.accordionHead}
                >
                  <Text style={styles.label}>
                    SCANNED TEXT IN IMAGE
                  </Text>
                  {isOcrOpen ? (
                    <ChevronUp
                      color={colors.textSecondary}
                      size={14}
                      strokeWidth={2}
                    />
                  ) : (
                    <ChevronDown
                      color={colors.textSecondary}
                      size={14}
                      strokeWidth={2}
                    />
                  )}
                </Pressable>

                {isOcrOpen && (
                  <Animated.View
                    entering={FadeIn.duration(150)}
                    exiting={FadeOut.duration(120)}
                  >
                    <View style={styles.ocrPanel}>
                      <ScrollView
                        style={{ maxHeight: 160 }}
                        showsVerticalScrollIndicator
                      >
                        <Text style={styles.ocrText} selectable>
                          {item.extractedText ||
                            'No text scanned in this image.'}
                        </Text>
                      </ScrollView>
                      <View style={styles.copyRow}>
                        <Pressable
                          onPress={handleCopy}
                          style={({ pressed }) => [
                            styles.copyBtn,
                            pressed && { transform: [{ scale: 0.96 }] },
                          ]}
                        >
                          {copied ? (
                            <Check
                              color={colors.bg}
                              size={11}
                              strokeWidth={2.4}
                            />
                          ) : (
                            <Copy
                              color={colors.bg}
                              size={11}
                              strokeWidth={2.4}
                            />
                          )}
                          <Text style={styles.copyText}>
                            {copied ? 'COPIED' : 'COPY ALL'}
                          </Text>
                        </Pressable>
                      </View>
                    </View>
                  </Animated.View>
                )}
              </View>

              <View style={{ height: 110 }} />
            </ScrollView>

            {/* Bottom action bar */}
            <View style={styles.actionBar}>
              <Pressable
                onPress={() => onDelete(item.id)}
                style={({ pressed }) => [
                  styles.actionBtn,
                  styles.deleteBtn,
                  pressed && { opacity: 0.85 },
                ]}
              >
                <Trash2 color={colors.accentCoral} size={12} strokeWidth={2} />
                <Text
                  style={[styles.actionText, { color: colors.accentCoral }]}
                >
                  DELETE
                </Text>
              </Pressable>

              <View style={{ flex: 1, position: 'relative' }}>
                <Pressable
                  onPress={() => setShowRegroupMenu(!showRegroupMenu)}
                  style={({ pressed }) => [
                    styles.actionBtn,
                    styles.regroupBtn,
                    pressed && { opacity: 0.85 },
                  ]}
                >
                  <FolderSync
                    color={colors.textPrimary}
                    size={12}
                    strokeWidth={2}
                  />
                  <Text style={styles.actionText}>MOVE</Text>
                </Pressable>

                {showRegroupMenu && (
                  <Animated.View
                    entering={FadeIn.duration(150)}
                    style={styles.regroupMenu}
                  >
                    <Text style={styles.regroupLabel}>
                      SELECT CATEGORY
                    </Text>
                    {CATEGORIES.map((cat) => (
                      <Pressable
                        key={cat}
                        onPress={() => {
                          onRegroup(item.id, cat);
                          setShowRegroupMenu(false);
                        }}
                        style={({ pressed }) => [
                          styles.regroupItem,
                          item.category === cat &&
                            styles.regroupItemActive,
                          pressed && { opacity: 0.85 },
                        ]}
                      >
                        <Text
                          style={[
                            styles.regroupItemText,
                            item.category === cat && {
                              color: colors.textOnDark,
                              fontWeight: '600',
                            },
                          ]}
                        >
                          {cat.toUpperCase()}
                        </Text>
                      </Pressable>
                    ))}
                  </Animated.View>
                )}
              </View>

              <Pressable
                onPress={handleShare}
                style={({ pressed }) => [
                  styles.actionBtn,
                  styles.regroupBtn,
                  pressed && { opacity: 0.85 },
                ]}
              >
                <Share2
                  color={colors.textPrimary}
                  size={12}
                  strokeWidth={2}
                />
                <Text style={styles.actionText}>SHARE</Text>
              </Pressable>
            </View>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: colors.overlayDim,
    justifyContent: 'flex-end',
  },
  sheet: {
    height: '92%',
    width: '100%',
  },
  sheetPanel: {
    flex: 1,
    overflow: 'hidden',
    backgroundColor: colors.bg,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    shadowColor: colors.shadowMed,
    shadowOffset: { width: 0, height: -8 },
    shadowOpacity: 1,
    shadowRadius: 24,
    elevation: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 22,
    paddingTop: 18,
    paddingBottom: 14,
    backgroundColor: colors.bg,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSubtle,
  },
  headerLeft: {
    flex: 1,
    paddingRight: 12,
  },
  title: {
    color: colors.textPrimary,
    fontFamily: fonts.display,
    fontSize: 22,
    fontWeight: '700',
    letterSpacing: -0.5,
    lineHeight: 26,
  },
  sub: {
    color: colors.textSecondary,
    fontSize: 10,
    fontFamily: fonts.mono,
    letterSpacing: 0.5,
    marginTop: 6,
  },
  closeBtn: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: colors.glassBgStrong,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    shadowColor: colors.shadowGlass,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 1,
  },
  closeBtnText: {
    color: colors.textPrimary,
    fontSize: 9.5,
    fontFamily: fonts.body,
    fontWeight: '700',
    letterSpacing: 1.2,
  },
  scroll: {
    paddingHorizontal: 22,
    paddingTop: 18,
    paddingBottom: 24,
  },
  heroWrap: {
    aspectRatio: 16 / 10,
    backgroundColor: colors.bgCard,
    borderRadius: 18,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    shadowColor: colors.shadowMed,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 12,
    elevation: 3,
  },
  heroImg: {
    width: '100%',
    height: '100%',
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'transparent',
  },
  zoomBtn: {
    position: 'absolute',
    top: 12,
    right: 12,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    backgroundColor: colors.glassBgStrong,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    shadowColor: colors.shadowGlass,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 1,
  },
  zoomText: {
    color: colors.textPrimary,
    fontSize: 8.5,
    letterSpacing: 1,
    fontFamily: fonts.body,
    fontWeight: '700',
  },
  descPanel: {
    backgroundColor: colors.glassBgStrong,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    shadowColor: colors.shadowGlass,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 1,
  },
  descText: {
    color: colors.textPrimary,
    fontFamily: fonts.body,
    fontSize: 12,
    lineHeight: 18,
  },
  label: {
    color: colors.textPrimary,
    fontSize: 9.5,
    letterSpacing: 1.4,
    fontFamily: fonts.body,
    fontWeight: '700',
  },
  sourcePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.glassBgStrong,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    borderRadius: 14,
    paddingVertical: 8,
    paddingHorizontal: 12,
    gap: 8,
    shadowColor: colors.shadowGlass,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 1,
  },
  sourceIconBox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    backgroundColor: colors.glassBg,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  favicon: {
    width: 12,
    height: 12,
    borderRadius: 2,
  },
  sourceText: {
    color: colors.textPrimary,
    fontSize: 11,
    fontFamily: fonts.mono,
    flex: 1,
  },
  accordionHead: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSubtle,
  },
  ocrPanel: {
    backgroundColor: colors.glassBgStrong,
    borderRadius: 16,
    padding: 14,
    gap: 12,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    shadowColor: colors.shadowGlass,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 1,
  },
  ocrText: {
    color: colors.textPrimary,
    fontFamily: fonts.mono,
    fontSize: 10.5,
    lineHeight: 16,
  },
  copyRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  copyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 7,
    backgroundColor: colors.textPrimary,
    borderRadius: 999,
    gap: 5,
  },
  copyText: {
    color: colors.bg,
    fontSize: 9.5,
    fontFamily: fonts.body,
    fontWeight: '700',
    letterSpacing: 1.2,
  },
  actionBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    paddingBottom: 22,
    flexDirection: 'row',
    gap: 8,
    backgroundColor: colors.bg,
    borderTopWidth: 1,
    borderTopColor: colors.borderSubtle,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 11,
    borderRadius: 999,
    gap: 5,
  },
  actionText: {
    color: colors.textPrimary,
    fontSize: 9.5,
    fontFamily: fonts.body,
    fontWeight: '700',
    letterSpacing: 1.2,
  },
  deleteBtn: {
    borderWidth: 1.5,
    borderColor: colors.accentCoral,
    backgroundColor: colors.accentCoralSoft,
  },
  regroupBtn: {
    borderWidth: 1.5,
    borderColor: colors.glassBorder,
    backgroundColor: colors.glassBgStrong,
    shadowColor: colors.shadowGlass,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 1,
  },
  regroupMenu: {
    position: 'absolute',
    bottom: 56,
    left: 0,
    right: 0,
    backgroundColor: colors.glassBgStrong,
    borderRadius: 16,
    padding: 6,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    gap: 2,
    shadowColor: colors.shadowMed,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 12,
    elevation: 6,
  },
  regroupLabel: {
    fontSize: 8,
    color: colors.textSecondary,
    letterSpacing: 1.2,
    fontFamily: fonts.body,
    fontWeight: '700',
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  regroupItem: {
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 8,
  },
  regroupItemActive: {
    backgroundColor: colors.textPrimary,
  },
  regroupItemText: {
    color: colors.textPrimary,
    fontSize: 10.5,
    fontFamily: fonts.body,
    fontWeight: '500',
    letterSpacing: 0.3,
  },
});
