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
import { GlassPanel } from './GlassPanel';
import { StashItem, CategoryKey } from '../types';
import { colors, radii } from '../theme/colors';

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
          <GlassPanel
            variant="base"
            borderRadius={28}
            intensity={42}
            style={styles.sheetPanel}
          >
            {/* Grab handle */}
            <View style={styles.handleRow}>
              <View style={styles.handle} />
            </View>

            <ScrollView
              contentContainerStyle={styles.scroll}
              showsVerticalScrollIndicator={false}
            >
              {/* Header */}
              <View style={styles.header}>
                <View style={{ flex: 1, paddingRight: 12 }}>
                  <Text style={styles.title}>{item.title}</Text>
                  <Text style={styles.sub}>
                    STASH · {item.category} ·{' '}
                    {new Date(item.createdAt).toLocaleDateString(undefined, {
                      day: 'numeric',
                      month: 'short',
                    })}
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
                    <ZoomOut color="#FFFFFF" size={10} strokeWidth={2.2} />
                  ) : (
                    <ZoomIn color="#FFFFFF" size={10} strokeWidth={2.2} />
                  )}
                  <Text style={styles.zoomText}>
                    {isZoomed ? 'ZOOM OUT' : 'PINCH TO ZOOM'}
                  </Text>
                </Pressable>
                {item.description && (
                  <View style={styles.heroDesc}>
                    <Text style={styles.heroDescText} numberOfLines={2}>
                      {item.description}
                    </Text>
                  </View>
                )}
              </View>

              {/* Source URL pill */}
              {item.sourceUrl && (
                <View style={{ gap: 6 }}>
                  <Text style={styles.label}>ORIGIN LINK NETWORK</Text>
                  <Pressable
                    onPress={() => Linking.openURL(item.sourceUrl!)}
                    style={({ pressed }) => [
                      styles.sourcePill,
                      pressed && { opacity: 0.85 },
                    ]}
                  >
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
                    <Text
                      style={styles.sourceText}
                      numberOfLines={1}
                    >
                      {item.sourceUrl.replace(/^https?:\/\/(www\.)?/i, '')}
                    </Text>
                    <ExternalLink
                      color={colors.textSecondary}
                      size={10}
                      strokeWidth={2}
                    />
                  </Pressable>
                </View>
              )}

              {/* OCR Accordion */}
              <View style={{ gap: 8 }}>
                <Pressable
                  onPress={() => setIsOcrOpen(!isOcrOpen)}
                  style={styles.accordionHead}
                >
                  <Text style={styles.label}>
                    EXTRACTED ALPHANUMERIC TEXT
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
                    <GlassPanel
                      variant="base"
                      borderRadius={12}
                      intensity={20}
                      style={styles.ocrPanel}
                    >
                      <ScrollView
                        style={{ maxHeight: 160 }}
                        showsVerticalScrollIndicator
                      >
                        <Text style={styles.ocrText} selectable>
                          {item.extractedText ||
                            '[NO TEXT CLIPPINGS RECORDED - OCR NOT TRIGGERED]'}
                        </Text>
                      </ScrollView>
                      <Pressable
                        onPress={handleCopy}
                        style={({ pressed }) => [
                          styles.copyBtn,
                          pressed && { transform: [{ scale: 0.96 }] },
                        ]}
                      >
                        {copied ? (
                          <Check
                            color={colors.emeraldDeep}
                            size={11}
                            strokeWidth={2.4}
                          />
                        ) : (
                          <Copy color="#000" size={11} strokeWidth={2.4} />
                        )}
                        <Text style={styles.copyText}>
                          {copied ? 'COPIED TO CLIPBOARD' : 'COPY ALL'}
                        </Text>
                      </Pressable>
                    </GlassPanel>
                  </Animated.View>
                )}
              </View>

              <View style={{ height: 80 }} />
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
                <Trash2 color={colors.red} size={11} strokeWidth={2} />
                <Text style={[styles.actionText, { color: colors.red }]}>
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
                    size={11}
                    strokeWidth={2}
                  />
                  <Text style={styles.actionText}>REGROUP</Text>
                </Pressable>

                {showRegroupMenu && (
                  <Animated.View
                    entering={FadeIn.duration(150)}
                    style={styles.regroupMenu}
                  >
                    <Text style={styles.regroupLabel}>
                      REASSIGN CATEGORY LENS
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
                          item.category === cat && styles.regroupItemActive,
                          pressed && { opacity: 0.85 },
                        ]}
                      >
                        <Text
                          style={[
                            styles.regroupItemText,
                            item.category === cat && {
                              color: '#000',
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
                <Share2 color={colors.textPrimary} size={11} strokeWidth={2} />
                <Text style={styles.actionText}>SHARE</Text>
              </Pressable>
            </View>
          </GlassPanel>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.65)',
    justifyContent: 'flex-end',
  },
  sheet: {
    height: '88%',
    width: '100%',
  },
  sheetPanel: {
    flex: 1,
    overflow: 'hidden',
  },
  handleRow: {
    width: '100%',
    alignItems: 'center',
    paddingVertical: 10,
  },
  handle: {
    width: 44,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  scroll: {
    paddingHorizontal: 22,
    paddingBottom: 24,
    gap: 18,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  title: {
    color: colors.textPrimary,
    fontSize: 18,
    fontWeight: '600',
    letterSpacing: -0.4,
    lineHeight: 22,
  },
  sub: {
    color: colors.textSecondary,
    fontSize: 10,
    fontStyle: 'italic',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    letterSpacing: 0.5,
    marginTop: 4,
  },
  closeBtn: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  closeBtnText: {
    color: colors.textSecondary,
    fontSize: 9,
    fontWeight: '500',
    letterSpacing: 1,
  },
  heroWrap: {
    aspectRatio: 16 / 9,
    backgroundColor: 'rgba(0,0,0,0.2)',
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  heroImg: {
    width: '100%',
    height: '100%',
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.0)',
  },
  zoomBtn: {
    position: 'absolute',
    top: 10,
    right: 10,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  zoomText: {
    color: colors.textPrimary,
    fontSize: 8,
    letterSpacing: 1,
    fontWeight: '500',
  },
  heroDesc: {
    position: 'absolute',
    bottom: 10,
    left: 10,
    right: 10,
  },
  heroDescText: {
    color: '#FFFFFF',
    fontSize: 10.5,
    lineHeight: 14,
  },
  label: {
    color: colors.textSecondary,
    fontSize: 9,
    letterSpacing: 1.5,
  },
  sourcePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    borderRadius: 999,
    paddingVertical: 7,
    paddingHorizontal: 12,
    gap: 6,
  },
  favicon: {
    width: 12,
    height: 12,
    borderRadius: 2,
  },
  sourceText: {
    color: colors.textPrimary,
    fontSize: 10,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    flex: 1,
  },
  accordionHead: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  ocrPanel: {
    padding: 12,
    gap: 12,
  },
  ocrText: {
    color: colors.textPrimary,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    fontSize: 10.5,
    lineHeight: 16,
  },
  copyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 5,
    backgroundColor: '#FFFFFF',
    borderRadius: 999,
    gap: 4,
  },
  copyText: {
    color: '#000000',
    fontSize: 9,
    fontWeight: '600',
    letterSpacing: 1,
  },
  actionBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    flexDirection: 'row',
    gap: 8,
    backgroundColor: 'rgba(0,0,0,0.8)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.05)',
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 999,
    gap: 5,
  },
  actionText: {
    color: colors.textPrimary,
    fontSize: 8.5,
    fontWeight: '600',
    letterSpacing: 1,
  },
  deleteBtn: {
    borderWidth: 1,
    borderColor: 'rgba(239,68,68,0.3)',
    backgroundColor: 'rgba(127,29,29,0.1)',
  },
  regroupBtn: {
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  regroupMenu: {
    position: 'absolute',
    bottom: 50,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(10,10,12,0.95)',
    borderRadius: 14,
    padding: 6,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    gap: 2,
  },
  regroupLabel: {
    fontSize: 7.5,
    color: colors.textMuted,
    letterSpacing: 1.2,
    paddingHorizontal: 8,
    paddingVertical: 5,
  },
  regroupItem: {
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 8,
  },
  regroupItemActive: {
    backgroundColor: '#FFFFFF',
  },
  regroupItemText: {
    color: colors.textSecondary,
    fontSize: 10.5,
    fontWeight: '500',
    letterSpacing: 0.3,
  },
});
