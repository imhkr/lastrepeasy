import React, { useMemo, useRef, useState } from "react";
import { View, Image, Text, PanResponder, StyleSheet, LayoutChangeEvent } from "react-native";
import { ProgressPhoto } from "../services/photoStore";

interface Props {
  before: ProgressPhoto;
  after: ProgressPhoto;
  mode: "slider" | "side";
}

/** Slider: drag the handle to reveal Before (left) over After (right). */
export const PhotoCompare: React.FC<Props> = ({ before, after, mode }) => {
  const [w, setW] = useState(0);
  const [pos, setPos] = useState(0.5);
  const start = useRef(0.5);
  const wRef = useRef(0);
  wRef.current = w;

  const pan = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        onPanResponderGrant: (e) => {
          const p = wRef.current ? Math.min(1, Math.max(0, e.nativeEvent.locationX / wRef.current)) : 0.5;
          start.current = p;
          setPos(p);
        },
        onPanResponderMove: (_, g) => {
          if (!wRef.current) return;
          setPos(Math.min(1, Math.max(0, start.current + g.dx / wRef.current)));
        },
      }),
    []
  );

  const onLayout = (e: LayoutChangeEvent) => setW(e.nativeEvent.layout.width);
  const h = w * 1.25;

  if (mode === "side") {
    return (
      <View style={styles.side} onLayout={onLayout}>
        {[before, after].map((p, i) => (
          <View key={p.id} style={{ flex: 1 }}>
            <Image source={{ uri: p.uri }} style={styles.sideImg} />
            <Text style={styles.sideTag}>{i === 0 ? "BEFORE" : "AFTER"}</Text>
          </View>
        ))}
      </View>
    );
  }

  return (
    <View style={[styles.box, { height: h || 300 }]} onLayout={onLayout} {...pan.panHandlers}>
      <Image source={{ uri: after.uri }} style={[styles.img, { width: w, height: h }]} pointerEvents="none" />
      <View style={[styles.clip, { width: w * pos, height: h }]} pointerEvents="none">
        <Image source={{ uri: before.uri }} style={{ width: w, height: h }} />
      </View>
      <View style={[styles.line, { left: w * pos - 1 }]} pointerEvents="none" />
      <View style={[styles.handle, { left: w * pos - 16 }]} pointerEvents="none">
        <Text style={styles.handleText}>⇄</Text>
      </View>
      <Text style={[styles.tag, { left: 10 }]}>BEFORE</Text>
      <Text style={[styles.tag, { right: 10 }]}>AFTER</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  box: { width: "100%", borderRadius: 14, overflow: "hidden", backgroundColor: "#000" },
  img: { position: "absolute", top: 0, left: 0, resizeMode: "cover" },
  clip: { position: "absolute", top: 0, left: 0, overflow: "hidden" },
  line: { position: "absolute", top: 0, bottom: 0, width: 2, backgroundColor: "#FFFFFF" },
  handle: { position: "absolute", top: "45%", width: 32, height: 32, borderRadius: 16, backgroundColor: "#FFFFFF", alignItems: "center", justifyContent: "center" },
  handleText: { color: "#0B0F17", fontSize: 16, fontWeight: "800" },
  tag: { position: "absolute", top: 10, color: "#FFFFFF", backgroundColor: "#000000AA", fontSize: 11, fontWeight: "800", paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, overflow: "hidden" },
  side: { flexDirection: "row", gap: 8 },
  sideImg: { width: "100%", aspectRatio: 0.8, borderRadius: 12, backgroundColor: "#000" },
  sideTag: { position: "absolute", top: 8, left: 8, color: "#FFFFFF", backgroundColor: "#000000AA", fontSize: 11, fontWeight: "800", paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, overflow: "hidden" },
});
