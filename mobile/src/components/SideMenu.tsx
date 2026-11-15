import React, { createContext, useContext, useState } from "react";
import { Modal, View, Text, TouchableOpacity, StyleSheet, Pressable } from "react-native";
import { useRouter, usePathname } from "expo-router";

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
  panel: { width: 290, backgroundColor: "#0F1623", paddingTop: 64, paddingHorizontal: 16, gap: 8, borderRightWidth: 1, borderRightColor: "#1E293B" },
  scrim: { flex: 1, backgroundColor: "#000000AA" },
  brand: { color: "#F8FAFC", fontSize: 26, fontWeight: "800" },
  tag: { color: "#94A3B8", fontSize: 13, marginBottom: 18 },
  item: { paddingVertical: 12, paddingHorizontal: 12, borderRadius: 12 },
  itemActive: { backgroundColor: "#12304A" },
  itemLabel: { color: "#F8FAFC", fontSize: 16, fontWeight: "700" },
  itemSub: { color: "#94A3B8", fontSize: 12, marginTop: 2 },
});
