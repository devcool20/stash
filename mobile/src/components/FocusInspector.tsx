import React, { useState, useEffect } from 'react';
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
  TextInput,
  Dimensions,
} from 'react-native';

const { width: WIN_WIDTH, height: WIN_HEIGHT } = Dimensions.get('window');
import Animated, {
  SlideInDown,
  SlideOutDown,
  FadeIn,
  FadeOut,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { Feather } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import { BlurView } from 'expo-blur';
import { StashItem, CategoryKey } from '../types';
import { colors, fonts, radii } from '../theme/colors';
import { resolveImageUri } from '../processing';

interface FocusInspectorProps {
  item: StashItem | null;
  visible: boolean;
  onClose: () => void;
  onDelete: (id: string) => void;
  onRegroup: (id: string, newCategory: CategoryKey) => void;
  onUpdate: (id: string, updates: Partial<StashItem>) => void;
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
  onUpdate,
}: FocusInspectorProps) {
  const [showFullScreen, setShowFullScreen] = useState(false);
  const [isOcrOpen, setIsOcrOpen] = useState(true);

  const resolved = item ? resolveImageUri(item.imageUrl) : '';
  const [imgSource, setImgSource] = useState(resolved);

  useEffect(() => {
    setImgSource(resolved);
  }, [resolved, item?.id]);
  const [copied, setCopied] = useState(false);
  const [showRegroupMenu, setShowRegroupMenu] = useState(false);

  const [isEditingDesc, setIsEditingDesc] = useState(false);
  const [editDescVal, setEditDescVal] = useState(item?.description || '');
  const [isEditingOcr, setIsEditingOcr] = useState(false);
  const [editOcrVal, setEditOcrVal] = useState(item?.extractedText || '');

  useEffect(() => {
    setEditDescVal(item?.description || '');
    setIsEditingDesc(false);
    setEditOcrVal(item?.extractedText || '');
    setIsEditingOcr(false);
  }, [item?.id, item?.description, item?.extractedText]);

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
    <>
      <Modal
        visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View style={styles.backdrop}>
        <Animated.View
          entering={FadeIn.duration(250)}
          exiting={FadeOut.duration(200)}
          style={StyleSheet.absoluteFill}
        >
          <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        </Animated.View>

        <Animated.View
          entering={SlideInDown.springify().damping(35).stiffness(320).mass(0.5)}
          exiting={SlideOutDown.springify().damping(35).stiffness(350).mass(0.5)}
          style={styles.sheet}
        >
          <View style={styles.sheetPanel}>
            {Platform.OS !== 'web' && (
              <BlurView
                intensity={45}
                tint="dark"
                style={StyleSheet.absoluteFill}
              />
            )}
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
              <Pressable
                onPress={() => setShowFullScreen(true)}
                style={styles.heroWrap}
              >
                <Image
                  source={{ uri: imgSource }}
                  style={styles.heroImg}
                  resizeMode="contain"
                  onError={() => {
                    setImgSource('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=600');
                  }}
                />
                <View style={styles.heroOverlay} />
                <View style={styles.zoomBtn}>
                  <Feather name="zoom-in" color={colors.textPrimary} size={10} />
                  <Text style={styles.zoomText}>TAP TO EXPAND</Text>
                </View>
              </Pressable>

              {/* Description Section */}
              <View style={{ gap: 6, marginTop: 18 }}>
                <View style={styles.labelRow}>
                  <Text style={styles.label}>
                    ABOUT THIS IMAGE
                  </Text>
                  {!isEditingDesc && (
                    <Pressable
                      onPress={() => setIsEditingDesc(true)}
                      style={({ pressed }) => [
                        styles.editIconBtn,
                        pressed && { opacity: 0.7 },
                      ]}
                    >
                      <Feather name="edit-2" color={colors.textSecondary} size={11} />
                    </Pressable>
                  )}
                </View>
                {isEditingDesc ? (
                  <View style={styles.inputContainer}>
                    <TextInput
                      style={styles.descInput}
                      multiline
                      value={editDescVal}
                      onChangeText={setEditDescVal}
                      placeholder="Add description..."
                      placeholderTextColor="#4E4E54"
                    />
                    <View style={styles.editActions}>
                      <Pressable
                        onPress={() => {
                          setIsEditingDesc(false);
                          setEditDescVal(item.description || '');
                        }}
                        style={({ pressed }) => [
                          styles.cancelBtn,
                          pressed && { opacity: 0.7 },
                        ]}
                      >
                        <Text style={styles.cancelBtnText}>CANCEL</Text>
                      </Pressable>
                      <Pressable
                        onPress={() => {
                          onUpdate(item.id, { description: editDescVal });
                          setIsEditingDesc(false);
                        }}
                        style={({ pressed }) => [
                          styles.saveBtn,
                          pressed && { opacity: 0.75 },
                        ]}
                      >
                        <Text style={styles.saveBtnText}>SAVE</Text>
                      </Pressable>
                    </View>
                  </View>
                ) : (
                  <View style={styles.descPanel}>
                    <Text style={[styles.descText, !item.description && styles.placeholderText]}>
                      {item.description || 'No description. Tap edit icon to add details.'}
                    </Text>
                  </View>
                )}
              </View>

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
                    <Feather
                      name="external-link"
                      color={colors.textSecondary}
                      size={11}
                    />
                  </Pressable>
                </View>
              )}

              {/* OCR Accordion */}
              <View style={{ gap: 8, marginTop: 18 }}>
                <View style={styles.accordionHeadRow}>
                  <Pressable
                    onPress={() => setIsOcrOpen(!isOcrOpen)}
                    style={styles.accordionHeadLeft}
                  >
                    <Text style={styles.label}>
                      SCANNED TEXT IN IMAGE
                    </Text>
                    {isOcrOpen ? (
                      <Feather
                        name="chevron-up"
                        color={colors.textSecondary}
                        size={14}
                      />
                    ) : (
                      <Feather
                        name="chevron-down"
                        color={colors.textSecondary}
                        size={14}
                      />
                    )}
                  </Pressable>
                  {isOcrOpen && !isEditingOcr && (
                    <Pressable
                      onPress={() => setIsEditingOcr(true)}
                      style={({ pressed }) => [
                        styles.editIconBtn,
                        pressed && { opacity: 0.7 },
                      ]}
                    >
                      <Feather name="edit-2" color={colors.textSecondary} size={11} />
                    </Pressable>
                  )}
                </View>

                {isOcrOpen && (
                  <Animated.View
                    entering={FadeIn.duration(250).springify()}
                    exiting={FadeOut.duration(120)}
                  >
                    {isEditingOcr ? (
                      <View style={styles.inputContainer}>
                        <TextInput
                          style={styles.ocrInput}
                          multiline
                          value={editOcrVal}
                          onChangeText={setEditOcrVal}
                          placeholder="Add scanned text..."
                          placeholderTextColor="#4E4E54"
                        />
                        <View style={styles.editActions}>
                          <Pressable
                            onPress={() => {
                              setIsEditingOcr(false);
                              setEditOcrVal(item.extractedText || '');
                            }}
                            style={({ pressed }) => [
                              styles.cancelBtn,
                              pressed && { opacity: 0.7 },
                            ]}
                          >
                            <Text style={styles.cancelBtnText}>CANCEL</Text>
                          </Pressable>
                          <Pressable
                            onPress={() => {
                              onUpdate(item.id, { extractedText: editOcrVal });
                              setIsEditingOcr(false);
                            }}
                            style={({ pressed }) => [
                              styles.saveBtn,
                              pressed && { opacity: 0.75 },
                            ]}
                          >
                            <Text style={styles.saveBtnText}>SAVE</Text>
                          </Pressable>
                        </View>
                      </View>
                    ) : (
                      <View style={styles.ocrPanel}>
                        <ScrollView
                          style={{ maxHeight: 160 }}
                          showsVerticalScrollIndicator
                        >
                          <Text style={[styles.ocrText, !item.extractedText && styles.placeholderText]} selectable>
                            {item.extractedText ||
                              'No text scanned in this image. Tap edit icon to add text.'}
                          </Text>
                        </ScrollView>
                        {item.extractedText ? (
                          <View style={styles.copyRow}>
                            <Pressable
                              onPress={handleCopy}
                              style={({ pressed }) => [
                                styles.copyBtn,
                                pressed && { transform: [{ scale: 0.96 }] },
                              ]}
                            >
                              {copied ? (
                                <Feather
                                  name="check"
                                  color="#FFFFFF"
                                  size={11}
                                />
                              ) : (
                                <Feather
                                  name="copy"
                                  color="#FFFFFF"
                                  size={11}
                                />
                              )}
                              <Text style={styles.copyText}>
                                {copied ? 'COPIED' : 'COPY ALL'}
                              </Text>
                            </Pressable>
                          </View>
                        ) : null}
                      </View>
                    )}
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
                <Feather name="trash-2" color={colors.accentCoral} size={12} />
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
                  <Feather
                    name="folder"
                    color={colors.textPrimary}
                    size={12}
                  />
                  <Text style={styles.actionText}>MOVE</Text>
                </Pressable>

                {showRegroupMenu && (
                  <Animated.View
                    entering={FadeIn.springify().damping(20).stiffness(200)}
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
                              color: '#FFFFFF',
                              fontWeight: '700',
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
                <Feather
                  name="share-2"
                  color={colors.textPrimary}
                  size={12}
                />
                <Text style={styles.actionText}>SHARE</Text>
              </Pressable>
            </View>
          </View>
        </Animated.View>
      </View>
    </Modal>

    {/* Full-Screen Zoomable Image Viewer Modal */}
    <Modal
        visible={showFullScreen}
        transparent
        animationType="fade"
        onRequestClose={() => setShowFullScreen(false)}
        statusBarTranslucent
      >
        <View style={styles.fullScreenBackdrop}>
          <ScrollView
            maximumZoomScale={4}
            minimumZoomScale={1}
            showsHorizontalScrollIndicator={false}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.fullScreenScroll}
          >
            <Image
              source={{ uri: imgSource }}
              style={styles.fullScreenImage}
              resizeMode="contain"
              onError={() => {
                setImgSource('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=600');
              }}
            />
          </ScrollView>

          <Pressable
            onPress={() => setShowFullScreen(false)}
            style={({ pressed }) => [
              styles.fullScreenCloseBtn,
              pressed && { opacity: 0.7 },
            ]}
          >
            <Feather name="x" color="#FFFFFF" size={20} />
          </Pressable>
        </View>
      </Modal>
    </>
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
    backgroundColor: 'rgba(10, 10, 10, 0.95)',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    shadowColor: colors.shadowMed,
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 1,
    shadowRadius: 32,
    elevation: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 22,
    paddingTop: 18,
    paddingBottom: 14,
    backgroundColor: 'transparent',
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
    width: '100%',
    height: 340,
    backgroundColor: 'rgba(255, 255, 255, 0.01)',
    borderRadius: 18,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
    shadowColor: colors.shadowMed,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 12,
    elevation: 3,
    alignItems: 'center',
    justifyContent: 'center',
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
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
    borderRadius: 999,
    gap: 5,
  },
  copyText: {
    color: '#FFFFFF',
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
    backgroundColor: 'transparent',
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
    borderWidth: 1,
    borderColor: 'transparent',
  },
  regroupItemActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    borderColor: 'rgba(255, 255, 255, 0.25)',
  },
  regroupItemText: {
    color: colors.textSecondary,
    fontSize: 10.5,
    fontFamily: fonts.body,
    fontWeight: '500',
    letterSpacing: 0.3,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  editIconBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  inputContainer: {
    gap: 8,
    width: '100%',
  },
  descInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderWidth: 1,
    borderColor: colors.glassBorder,
    borderRadius: 16,
    padding: 12,
    color: colors.textPrimary,
    fontFamily: fonts.body,
    fontSize: 12,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  ocrInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderWidth: 1,
    borderColor: colors.glassBorder,
    borderRadius: 16,
    padding: 12,
    color: colors.textPrimary,
    fontFamily: fonts.mono,
    fontSize: 10.5,
    minHeight: 120,
    textAlignVertical: 'top',
  },
  editActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
    marginTop: 2,
  },
  saveBtn: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 999,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveBtnText: {
    color: '#000000',
    fontSize: 9.5,
    fontWeight: '700',
    fontFamily: fonts.body,
    letterSpacing: 0.8,
  },
  cancelBtn: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 999,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelBtnText: {
    color: colors.textPrimary,
    fontSize: 9.5,
    fontWeight: '500',
    fontFamily: fonts.body,
    letterSpacing: 0.8,
  },
  placeholderText: {
    color: colors.textTertiary,
    fontStyle: 'italic',
  },
  accordionHeadRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSubtle,
  },
  accordionHeadLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  fullScreenBackdrop: {
    flex: 1,
    backgroundColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullScreenScroll: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullScreenImage: {
    width: WIN_WIDTH,
    height: WIN_HEIGHT,
  },
  fullScreenCloseBtn: {
    position: 'absolute',
    top: 50,
    right: 20,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
});
