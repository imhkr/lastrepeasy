import React, { createContext, useContext, useState } from "react";
import { Alert, Modal, Platform, View, Text, TouchableOpacity, StyleSheet, Pressable } from "react-native";
import { useRouter, usePathname } from "expo-router";
import { clearAllLocalData } from "../services/kv";

const MenuCtx = createContext<{ open: boolean; setOpen: (v: boolean) => void }>({ open: false, setOpen: () => {} });
export const useMenu = () => useContext(MenuCtx);

export const MenuProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [open, setOpen] = useState(false);
  return (
    <MenuCtx.Provider value={{ open, setOpen }}>
      {children}
      <SideMenu />
    </MenuCtx.Provider>
  );
};

/** Three-bar button for the header. */
export const MenuButton: React.FC = () => {
  const { setOpen } = useMenu();
  return (
    <TouchableOpacity onPress={() => setOpen(true)} style={styles.burger} accessibilityLabel="Open menu">
      <View style={styles.bar} />
      <View style={styles.bar} />
      <View style={styles.bar} />
    </TouchableOpacity>
  );
};

export const MENU_ITEMS = [
  { label: "Home", sub: "Start here", path: "/" },
  { label: "Training plans", sub: "Min-Max and Pure Bodybuilding PPL", path: "/plans" },
  { label: "My lifts", sub: "Last time vs this time", path: "/lifts" },
  { label: "Progress photos", sub: "Compare before and after", path: "/photos" },
  { label: "Live coach", sub: "Camera watches your set, tells you what to fix", path: "/live" },
  { label: "Form check", sub: "Upload a set, find what to fix", path: "/form" },
] as const;

const SideMenu: React.FC = () => {
  const { open, setOpen } = useMenu();
  const router = useRouter();
  const pathname = usePathname();

  const go = (path: string) => {
    setOpen(false);
    router.navigate(path as any);
  };

  const confirmDeleteAll = () => {
    const run = async () => {
      await clearAllLocalData();
      setOpen(false);
      router.replace("/");
      if (Platform.OS !== "web") Alert.alert("Done", "All local data deleted.");
    };
    if (Platform.OS === "web") {
      if (typeof window !== "undefined" && window.confirm("Delete all local data? This permanently removes lifts, photos, form checks, plan edits, and coach logs.")) {
        void run();
      }
      return;
    }
    Alert.alert(
      "Delete all local data?",
      "This permanently removes your logged lifts, progress photos, saved form checks, custom plan edits, and Live Coach warnings/errors.",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Delete all", style: "destructive", onPress: () => void run() },
      ]
    );
  };

  return (
    <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
      <View style={styles.root}>
        <View style={styles.panel}>
          <Text style={styles.brand}>LastRepEasy</Text>
          <Text style={styles.tag}>Train. Track. Compare.</Text>
          {MENU_ITEMS.map((it) => {
            const active = it.path === "/" ? pathname === "/" : pathname.startsWith(it.path);
            return (
              <TouchableOpacity key={it.path} style={[styles.item, active && styles.itemActive]} onPress={() => go(it.path)}>
                <Text style={styles.itemLabel}>{it.label}</Text>
                <Text style={styles.itemSub}>{it.sub}</Text>
              </TouchableOpacity>
            );
          })}
          <TouchableOpacity style={styles.dangerBtn} onPress={confirmDeleteAll}>
            <Text style={styles.dangerLabel}>Delete all local data</Text>
            <Text style={styles.dangerSub}>Wipes lifts, photos, form checks & coach logs</Text>
          </TouchableOpacity>
        </View>
        <Pressable style={styles.scrim} onPress={() => setOpen(false)} accessibilityLabel="Close menu" />
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  burger: { padding: 10, gap: 4 },
  bar: { width: 20, height: 2, borderRadius: 1, backgroundColor: "#F8FAFC" },
  root: { flex: 1, flexDirection: "row" },
  panel: { width: 290, backgroundColor: "#0F1623", paddingTop: 64, paddingBottom: 28, paddingHorizontal: 16, gap: 8, borderRightWidth: 1, borderRightColor: "#1E293B" },
  scrim: { flex: 1, backgroundColor: "#000000AA" },
  brand: { color: "#F8FAFC", fontSize: 26, fontWeight: "800" },
  tag: { color: "#94A3B8", fontSize: 13, marginBottom: 18 },
  item: { paddingVertical: 12, paddingHorizontal: 12, borderRadius: 12 },
  itemActive: { backgroundColor: "#12304A" },
  itemLabel: { color: "#F8FAFC", fontSize: 16, fontWeight: "700" },
  itemSub: { color: "#94A3B8", fontSize: 12, marginTop: 2 },
  dangerBtn: { marginTop: "auto", backgroundColor: "#2B1215", borderWidth: 1, borderColor: "#7F1D1D", borderRadius: 12, paddingVertical: 12, paddingHorizontal: 12 },
  dangerLabel: { color: "#FCA5A5", fontSize: 15, fontWeight: "800" },
  dangerSub: { color: "#F87171", fontSize: 11, marginTop: 2 },
});
