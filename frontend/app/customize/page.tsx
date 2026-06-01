"use client";

import React, { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { Palette, Type, Upload, ArrowLeftRight, Trash2, Save, ShoppingBag, ZoomIn, Layers, CheckCircle2, Eye, EyeOff, Lock, Unlock, ArrowUp, ArrowDown, Copy, ChevronDown } from "lucide-react";
import { useCartStore } from "@/store/cartStore";
import { useAuthStore } from "@/store/authStore";
import { API_BASE } from "@/config";
import { motion, AnimatePresence } from "framer-motion";

// Predefined colors organized by category
const SHIRT_COLORS = [
  // Neutrals
  { name: "Carbon Black", hex: "#0a0a0c", category: "Neutrals" },
  { name: "Off White", hex: "#f4f4f7", category: "Neutrals" },
  { name: "Ash Grey", hex: "#9e9e9e", category: "Neutrals" },
  { name: "Stone", hex: "#6b6b6b", category: "Neutrals" },
  { name: "Chalk", hex: "#e8e3dc", category: "Neutrals" },
  // Streetwear Darks
  { name: "Midnight Navy", hex: "#0a192f", category: "Darks" },
  { name: "Tokyo Violet", hex: "#2b1055", category: "Darks" },
  { name: "Crimson Red", hex: "#781e28", category: "Darks" },
  { name: "Forest Hunter", hex: "#1a2e1a", category: "Darks" },
  { name: "Espresso", hex: "#2c1a0e", category: "Darks" },
  // Earth Tones
  { name: "Desert Sand", hex: "#d7ccc8", category: "Earth" },
  { name: "Sage Green", hex: "#607267", category: "Earth" },
  { name: "Terra Cotta", hex: "#c1694f", category: "Earth" },
  { name: "Warm Khaki", hex: "#c8b87a", category: "Earth" },
  { name: "Rust Brown", hex: "#8b4513", category: "Earth" },
  // Pastels & Brights
  { name: "Peach Sunset", hex: "#ffab91", category: "Pastels" },
  { name: "Sky Blue", hex: "#90caf9", category: "Pastels" },
  { name: "Mint Fresh", hex: "#a5d6a7", category: "Pastels" },
  { name: "Lavender", hex: "#ce93d8", category: "Pastels" },
  { name: "Butter Yellow", hex: "#fff59d", category: "Pastels" },
];

const COLOR_CATEGORIES = ["All", "Neutrals", "Darks", "Earth", "Pastels"];

const FONTS_LIST = [
  "Outfit", "Inter", "Montserrat", "Raleway", "Oswald",
  "Impact", "Bebas Neue", "Anton",
  "Playfair Display", "Cinzel", "Italiana", "Cormorant Garamond", "IM Fell English",
  "Cinzel Decorative", "MedievalSharp",
  "Courier New", "Space Mono", "Share Tech Mono",
  "Permanent Marker", "Pacifico", "Dancing Script",
  "Teko", "Exo 2", "Rajdhani"
];

const FONT_CATEGORIES: Record<string, string[]> = {
  "Modern Sans": ["Outfit", "Inter", "Montserrat", "Raleway", "Oswald"],
  "Impact / Display": ["Impact", "Bebas Neue", "Anton", "Teko"],
  "Editorial Serif": ["Playfair Display", "Cinzel", "Italiana", "Cormorant Garamond"],
  "Decorative": ["Cinzel Decorative", "Permanent Marker", "Pacifico", "Dancing Script"],
  "Monospace": ["Courier New", "Space Mono", "Share Tech Mono"],
  "Urban": ["Exo 2", "Rajdhani"],
};

const TEXT_STYLE_PRESETS = [
  { name: "Bold Drop", fontFamily: "Bebas Neue", fontWeight: "bold", fontSize: 36, fill: "#ffffff", fontStyle: "normal", textDecoration: "", shadow: "" },
  { name: "Editorial", fontFamily: "Playfair Display", fontWeight: "normal", fontSize: 22, fill: "#ffffff", fontStyle: "italic", textDecoration: "", shadow: "" },
  { name: "Street Tag", fontFamily: "Impact", fontWeight: "bold", fontSize: 28, fill: "#ffff00", fontStyle: "normal", textDecoration: "", shadow: "2px 2px 4px rgba(0,0,0,0.8)" },
  { name: "Minimal", fontFamily: "Outfit", fontWeight: "normal", fontSize: 18, fill: "#e0e0e0", fontStyle: "normal", textDecoration: "", shadow: "" },
  { name: "Vintage", fontFamily: "Cinzel", fontWeight: "bold", fontSize: 20, fill: "#d4af37", fontStyle: "normal", textDecoration: "", shadow: "1px 1px 0px #000" },
  { name: "Grunge", fontFamily: "Permanent Marker", fontWeight: "normal", fontSize: 26, fill: "#ff4444", fontStyle: "normal", textDecoration: "", shadow: "3px 3px 6px rgba(0,0,0,0.9)" },
];

// Curated streetwear logos & artwork designs library
const PRESET_GRAPHICS = [
  { name: "Golden Lotus", url: "/images/products/lotus_tee.png" },
  { name: "Tokyo Neon circles", url: "/images/products/neon_tee.png" },
  { name: "Midnight Heavy Crest", url: "/images/products/blank_tee_black.png" },
  { name: "Studio Signature Tag", url: "/images/products/blank_tee_white.png" }
];

function CustomizePageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const designIdParam = searchParams.get("design_id");
  const [activeDesignId, setActiveDesignId] = useState<string | null>(null);
  const { addToCart } = useCartStore();
  const { user, isAuthenticated } = useAuthStore();

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [fabricCanvas, setFabricCanvas] = useState<any>(null);
  
  // Customizer States
  const [selectedColor, setSelectedColor] = useState(SHIRT_COLORS[0]);
  const [activeTab, setActiveTab] = useState<"color" | "text" | "upload">("color");
  const [currentView, setCurrentView] = useState<"front" | "back">("front");
  const [colorCategory, setColorCategory] = useState("All");
  const [fontCategory, setFontCategory] = useState("Modern Sans");
  
  // Selected Element State
  const [selectedObject, setSelectedObject] = useState<any>(null);
  const [textInput, setTextInput] = useState("");
  const [textColor, setTextColor] = useState("#ffffff");
  const [fontFamily, setFontFamily] = useState(FONTS_LIST[0]);
  const [fontSize, setFontSize] = useState(24);
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);
  const [textAlign, setTextAlign] = useState<"left"|"center"|"right">("center");
  const [hasShadow, setHasShadow] = useState(false);
  const [textCurve, setTextCurve] = useState(0); // Curved text arch percentage state
  const [isCircularText, setIsCircularText] = useState(false); // Circle text state
  const [circleRadius, setCircleRadius] = useState(80); // Circle text radius state
  const [isFontDropdownOpen, setIsFontDropdownOpen] = useState(false);
  const [objectsCount, setObjectsCount] = useState(0);
  const [canvasLayers, setCanvasLayers] = useState<any[]>([]);

  // Function to refresh layers from canvas
  const updateLayersList = (canvas: any) => {
    if (!canvas) return;
    const objects = canvas.getObjects().map((obj: any, idx: number) => {
      if (!obj.id) {
        obj.id = `layer_${idx}_${Date.now()}`;
      }
      return {
        id: obj.id,
        type: obj.type,
        text: obj.type === "i-text" ? (obj.text || "Text Layer") : "Graphic Art",
        visible: obj.visible !== false,
        locked: !!obj.lockMovementX,
        ref: obj
      };
    });
    setCanvasLayers([...objects].reverse());
  };

  const toggleLayerLock = (layerObj: any) => {
    if (!fabricCanvas) return;
    const isLocked = !layerObj.lockMovementX;
    layerObj.set({
      lockMovementX: isLocked,
      lockMovementY: isLocked,
      lockScalingX: isLocked,
      lockScalingY: isLocked,
      lockRotation: isLocked,
      hasControls: !isLocked
    });
    fabricCanvas.discardActiveObject();
    fabricCanvas.renderAll();
    updateLayersList(fabricCanvas);
  };

  const toggleLayerVisibility = (layerObj: any) => {
    if (!fabricCanvas) return;
    layerObj.set("visible", layerObj.visible === false);
    fabricCanvas.discardActiveObject();
    fabricCanvas.renderAll();
    updateLayersList(fabricCanvas);
  };

  const moveLayerIndex = (layerObj: any, direction: "up" | "down") => {
    if (!fabricCanvas) return;
    if (direction === "up") {
      fabricCanvas.bringForward(layerObj);
    } else {
      fabricCanvas.sendBackwards(layerObj);
    }
    fabricCanvas.renderAll();
    updateLayersList(fabricCanvas);
  };

  const selectLayerObject = (layerObj: any) => {
    if (!fabricCanvas) return;
    if (layerObj.visible === false) {
      layerObj.set("visible", true);
    }
    fabricCanvas.setActiveObject(layerObj);
    fabricCanvas.renderAll();
    setSelectedObject(layerObj);
    if (layerObj.type === "i-text") {
      setTextInput(layerObj.text || "");
      setTextColor(layerObj.fill || "#ffffff");
      setFontFamily(layerObj.fontFamily || FONTS_LIST[0]);
    }
  };

  // Premium Animated Toast state
  const [toast, setToast] = useState<{ show: boolean; message: string }>({
    show: false,
    message: ""
  });

  const showCustomToast = (message: string) => {
    setToast({ show: true, message });
    setTimeout(() => {
      setToast(prev => ({ ...prev, show: false }));
    }, 4000);
  };
  
  // Canvas store states for front/back toggle
  const frontCanvasState = useRef<string | null>(null);
  const backCanvasState = useRef<string | null>(null);

  const isInitialized = useRef(false);
  const canvasInstanceRef = useRef<any>(null);

  // Dynamic client-side loading of Fabric.js to guarantee 0 build-time SSR issues
  useEffect(() => {
    import("fabric").then((fabricModule) => {
      if (isInitialized.current || !canvasRef.current) return;
      isInitialized.current = true;

      const CanvasClass = fabricModule.Canvas;
      const canvasInstance = new CanvasClass("designer-canvas", {
        width: 320,
        height: 400,
        backgroundColor: "transparent",
        preserveObjectStacking: true
      });

      // Object selection listeners
      canvasInstance.on("selection:created", (e: any) => {
        const obj = e.selected[0];
        setSelectedObject(obj);
        if (obj.type === "i-text") {
          setTextInput(obj.text || "");
          setTextColor(obj.fill || "#ffffff");
          setFontFamily(obj.fontFamily || FONTS_LIST[0]);
          setTextCurve(obj.curveValue || 0);
          setIsCircularText(obj.isCircular || false);
          setCircleRadius(obj.circleRadiusValue || 80);
        }
        updateLayersList(canvasInstance);
      });

      canvasInstance.on("selection:updated", (e: any) => {
        const obj = e.selected[0];
        setSelectedObject(obj);
        if (obj.type === "i-text") {
          setTextInput(obj.text || "");
          setTextColor(obj.fill || "#ffffff");
          setFontFamily(obj.fontFamily || FONTS_LIST[0]);
          setTextCurve(obj.curveValue || 0);
          setIsCircularText(obj.isCircular || false);
          setCircleRadius(obj.circleRadiusValue || 80);
        }
        updateLayersList(canvasInstance);
      });

      canvasInstance.on("selection:cleared", () => {
        setSelectedObject(null);
        updateLayersList(canvasInstance);
      });

      canvasInstance.on("object:added", () => {
        setObjectsCount(canvasInstance.getObjects().length);
        updateLayersList(canvasInstance);
      });

      canvasInstance.on("object:removed", () => {
        setObjectsCount(canvasInstance.getObjects().length);
        updateLayersList(canvasInstance);
      });

      canvasInstance.on("object:modified", () => {
        updateLayersList(canvasInstance);
      });

      setFabricCanvas(canvasInstance);
      canvasInstanceRef.current = canvasInstance;
    });

    return () => {
      isInitialized.current = false;
      if (canvasInstanceRef.current) {
        canvasInstanceRef.current.dispose();
        canvasInstanceRef.current = null;
      }
    };
  }, []);

  // Fetch and load selected custom design template if design_id param is found in URL
  useEffect(() => {
    if (!designIdParam || !fabricCanvas) return;

    fetch(`${API_BASE}/api/designs/${designIdParam}`)
      .then((res) => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then((data) => {
        setActiveDesignId(data.id);
        
        // Find and set shirt color
        const matchedColor = SHIRT_COLORS.find(
          (c) => c.name.toLowerCase() === data.shirt_color.toLowerCase()
        ) || SHIRT_COLORS.find(
          (c) => c.hex.toLowerCase() === data.shirt_color.toLowerCase()
        );
        if (matchedColor) {
          setSelectedColor(matchedColor);
        }

        // Set current view
        if (data.view) {
          setCurrentView(data.view as "front" | "back");
        }
        
        // Load the Fabric.js JSON state safely
        if (data.canvas_json) {
          try {
            fabricCanvas.loadFromJSON(JSON.parse(data.canvas_json)).then(() => {
              fabricCanvas.renderAll();
              setObjectsCount(fabricCanvas.getObjects().length);
              updateLayersList(fabricCanvas);
            }).catch(() => {
              fabricCanvas.loadFromJSON(JSON.parse(data.canvas_json), () => {
                fabricCanvas.renderAll();
                setObjectsCount(fabricCanvas.getObjects().length);
                updateLayersList(fabricCanvas);
              });
            });
          } catch (e) {
            fabricCanvas.loadFromJSON(JSON.parse(data.canvas_json), () => {
              fabricCanvas.renderAll();
              setObjectsCount(fabricCanvas.getObjects().length);
              updateLayersList(fabricCanvas);
            });
          }
        }
        
        showCustomToast("Customized template loaded successfully! Make edits and click Save.");
      })
      .catch(() => {
        showCustomToast("Failed to load the selected custom design template.");
      });
  }, [designIdParam, fabricCanvas]);

  // Handle front/back view toggle
  const toggleView = () => {
    if (!fabricCanvas) return;
    
    // Save current view
    const currentJson = JSON.stringify(fabricCanvas.toJSON());
    if (currentView === "front") {
      frontCanvasState.current = currentJson;
      setCurrentView("back");
      // Load back state or clear
      fabricCanvas.discardActiveObject();
      fabricCanvas.clear();
      if (backCanvasState.current) {
        fabricCanvas.loadFromJSON(JSON.parse(backCanvasState.current)).then(() => {
          fabricCanvas.renderAll();
          updateLayersList(fabricCanvas);
        });
      } else {
        updateLayersList(fabricCanvas);
      }
    } else {
      backCanvasState.current = currentJson;
      setCurrentView("front");
      // Load front state or clear
      fabricCanvas.discardActiveObject();
      fabricCanvas.clear();
      if (frontCanvasState.current) {
        fabricCanvas.loadFromJSON(JSON.parse(frontCanvasState.current)).then(() => {
          fabricCanvas.renderAll();
          updateLayersList(fabricCanvas);
        });
      } else {
        updateLayersList(fabricCanvas);
      }
    }
  };

  // Load custom premium preset graphics onto fabric canvas
  const addPresetGraphic = (url: string) => {
    if (!fabricCanvas) return;
    
    import("fabric").then((fabricModule) => {
      const FabricImageClass = fabricModule.FabricImage;
      
      FabricImageClass.fromURL(url).then((img: any) => {
        img.scaleToWidth(140);
        img.set({
          left: 90,
          top: 130,
          cornerColor: "#7a1c27",
          cornerSize: 8,
          transparentCorners: false
        });
        
        fabricCanvas.add(img);
        fabricCanvas.setActiveObject(img);
        fabricCanvas.renderAll();
      });
    });
  };

  // Add editable text layer
  const addText = () => {
    if (!fabricCanvas) return;
    import("fabric").then((fabricModule) => {
      const ITextClass = fabricModule.IText;
      const shadowObj = hasShadow ? new fabricModule.Shadow({ color: "rgba(0,0,0,0.8)", blur: 6, offsetX: 2, offsetY: 2 }) : undefined;
      const text = new ITextClass("YOUR TEXT HERE", {
        left: 60, top: 140,
        fontFamily, fill: textColor, fontSize,
        fontWeight: isBold ? "bold" : "normal",
        fontStyle: isItalic ? "italic" : "normal",
        underline: isUnderline,
        textAlign,
        ...(shadowObj ? { shadow: shadowObj } : {}),
        cornerColor: "#7a1c27", cornerSize: 8, transparentCorners: false
      });
      fabricCanvas.add(text);
      fabricCanvas.setActiveObject(text);
      fabricCanvas.renderAll();
    });
  };

  const applyTextStylePreset = (preset: typeof TEXT_STYLE_PRESETS[0]) => {
    setFontFamily(preset.fontFamily);
    setIsBold(preset.fontWeight === "bold");
    setIsItalic(preset.fontStyle === "italic");
    setFontSize(preset.fontSize);
    setTextColor(preset.fill);
    setHasShadow(!!preset.shadow);
    if (fabricCanvas && selectedObject && selectedObject.type === "i-text") {
      selectedObject.set({
        fontFamily: preset.fontFamily,
        fontWeight: preset.fontWeight,
        fontStyle: preset.fontStyle,
        fontSize: preset.fontSize,
        fill: preset.fill,
      });
      fabricCanvas.renderAll();
    }
  };

  // Add custom logo upload
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!fabricCanvas || !e.target.files?.[0]) return;
    
    const file = e.target.files[0];
    const reader = new FileReader();
    
    reader.onload = (fEvent) => {
      const dataUrl = fEvent.target?.result as string;
      
      import("fabric").then((fabricModule) => {
        const FabricImageClass = fabricModule.FabricImage;
        
        FabricImageClass.fromURL(dataUrl).then((img: any) => {
          // Scale image down to fit print bounds
          img.scaleToWidth(150);
          img.set({
            left: 85,
            top: 120,
            cornerColor: "#7a1c27",
            cornerSize: 8,
            transparentCorners: false
          });
          
          fabricCanvas.add(img);
          fabricCanvas.setActiveObject(img);
          fabricCanvas.renderAll();
        });
      });
    };
    
    reader.readAsDataURL(file);
  };

  // Update text attributes dynamically
  const updateTextProp = (newVal: string | number | boolean, type: string) => {
    if (!fabricCanvas || !selectedObject) return;
    if (type === "text") { setTextInput(newVal as string); selectedObject.set("text", newVal); }
    else if (type === "color") { setTextColor(newVal as string); selectedObject.set("fill", newVal); }
    else if (type === "font") { setFontFamily(newVal as string); selectedObject.set("fontFamily", newVal); }
    else if (type === "size") { setFontSize(newVal as number); selectedObject.set("fontSize", newVal); }
    else if (type === "bold") { const b = !isBold; setIsBold(b); selectedObject.set("fontWeight", b ? "bold" : "normal"); }
    else if (type === "italic") { const i = !isItalic; setIsItalic(i); selectedObject.set("fontStyle", i ? "italic" : "normal"); }
    else if (type === "underline") { const u = !isUnderline; setIsUnderline(u); selectedObject.set("underline", u); }
    else if (type === "align") { setTextAlign(newVal as "left"|"center"|"right"); selectedObject.set("textAlign", newVal); }
    else if (type === "shadow") {
      import("fabric").then(fm => {
        const s = !hasShadow; setHasShadow(s);
        selectedObject.set("shadow", s ? new fm.Shadow({ color: "rgba(0,0,0,0.85)", blur: 6, offsetX: 2, offsetY: 2 }) : null);
        fabricCanvas.renderAll();
      }); return;
    }
    else if (type === "curve") {
      const val = newVal as number;
      setTextCurve(val);
      selectedObject.set("curveValue", val);
      
      if (val === 0) {
        selectedObject.set("path", null);
        selectedObject.setCoords();
        fabricCanvas.renderAll();
      } else {
        import("fabric").then((fabricModule) => {
          // Calculate an SVG quadratic curve relative to the text element container.
          // Path spans dynamically based on text size.
          const controlY = 100 - val * 1.5;
          const pathString = `M 10 100 Q 160 ${controlY} 310 100`;
          
          const textPath = new fabricModule.Path(pathString, {
            fill: "transparent",
            stroke: "transparent",
            visible: false
          });
          
          selectedObject.set({
            path: textPath,
            pathAlign: "center"
          });
          selectedObject.setCoords();
          fabricCanvas.renderAll();
        });
        return;
      }
    }
    else if (type === "circular") {
      const isCirc = newVal as boolean;
      setIsCircularText(isCirc);
      selectedObject.set("isCircular", isCirc);
      
      if (!isCirc) {
        // Return to standard curve / flat text
        if (textCurve === 0) {
          selectedObject.set("path", null);
          selectedObject.setCoords();
          fabricCanvas.renderAll();
        } else {
          // Reapply regular arc curve path
          import("fabric").then((fabricModule) => {
            const controlY = 100 - textCurve * 1.5;
            const pathString = `M 10 100 Q 160 ${controlY} 310 100`;
            const textPath = new fabricModule.Path(pathString, {
              fill: "transparent",
              stroke: "transparent",
              visible: false
            });
            selectedObject.set({ path: textPath, pathAlign: "center" });
            selectedObject.setCoords();
            fabricCanvas.renderAll();
          });
          return;
        }
      } else {
        // Apply Circular Path (wraps text 360 degrees)
        import("fabric").then((fabricModule) => {
          const R = circleRadius;
          const pathString = `M ${160 - R} 160 A ${R} ${R} 0 1 1 ${160 + R} 160 A ${R} ${R} 0 1 1 ${160 - R} 160`;
          const textPath = new fabricModule.Path(pathString, {
            fill: "transparent",
            stroke: "transparent",
            visible: false
          });
          selectedObject.set({ path: textPath, pathAlign: "center" });
          selectedObject.setCoords();
          fabricCanvas.renderAll();
        });
        return;
      }
    }
    else if (type === "radius") {
      const R = newVal as number;
      setCircleRadius(R);
      selectedObject.set("circleRadiusValue", R);
      
      if (isCircularText) {
        import("fabric").then((fabricModule) => {
          const pathString = `M ${160 - R} 160 A ${R} ${R} 0 1 1 ${160 + R} 160 A ${R} ${R} 0 1 1 ${160 - R} 160`;
          const textPath = new fabricModule.Path(pathString, {
            fill: "transparent",
            stroke: "transparent",
            visible: false
          });
          selectedObject.set({ path: textPath, pathAlign: "center" });
          selectedObject.setCoords();
          fabricCanvas.renderAll();
        });
        return;
      }
    }
    fabricCanvas.renderAll();
  };

  // Remove Selected layer
  const deleteSelected = () => {
    if (!fabricCanvas || !selectedObject) return;
    fabricCanvas.remove(selectedObject);
    fabricCanvas.discardActiveObject();
    fabricCanvas.renderAll();
    setSelectedObject(null);
  };

  // Center selected object horizontally in print zone
  const centerObjectH = () => {
    if (!fabricCanvas || !selectedObject) return;
    selectedObject.viewportCenterH();
    selectedObject.setCoords();
    fabricCanvas.renderAll();
  };

  // Center selected object vertically in print zone
  const centerObjectV = () => {
    if (!fabricCanvas || !selectedObject) return;
    selectedObject.viewportCenterV();
    selectedObject.setCoords();
    fabricCanvas.renderAll();
  };

  // Bring selected object to front layer
  const bringObjectToFront = () => {
    if (!fabricCanvas || !selectedObject) return;
    selectedObject.bringToFront();
    fabricCanvas.renderAll();
  };

  // Duplicate active canvas layer
  const duplicateObject = () => {
    if (!fabricCanvas || !selectedObject) return;
    selectedObject.clone().then((cloned: any) => {
      cloned.set({
        left: cloned.left + 15,
        top: cloned.top + 15,
        cornerColor: "#7a1c27",
        cornerSize: 8,
        transparentCorners: false
      });
      fabricCanvas.add(cloned);
      fabricCanvas.setActiveObject(cloned);
      fabricCanvas.renderAll();
    });
  };

  // Save layout state back to DB or local storage
  const handleSaveDesign = () => {
    if (!fabricCanvas) return;
    if (!isAuthenticated) {
      showCustomToast("Please login to save your custom designs permanently!");
      router.push("/dashboard?mode=login");
      return;
    }

    const dataUrl = fabricCanvas.toDataURL({ format: "png", quality: 1.0 });
    const canvasJson = JSON.stringify(fabricCanvas.toJSON());

    const method = activeDesignId ? "PUT" : "POST";
    const endpoint = activeDesignId 
      ? `${API_BASE}/api/designs/${activeDesignId}` 
      : `${API_BASE}/api/designs`;

    fetch(endpoint, {
      method,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("kora_token")}`
      },
      body: JSON.stringify({
        canvas_json: canvasJson,
        preview_image_url: dataUrl,
        shirt_color: selectedColor.name,
        view: currentView
      })
    })
      .then((res) => {
        if (res.status === 200 || res.status === 201) {
          showCustomToast(activeDesignId 
            ? "Success! Your edited layout changes have been saved to your account."
            : "Success! Your new custom layout has been saved to your account.");
        } else {
          throw new Error();
        }
      })
      .catch(() => {
        showCustomToast("Failed to save changes to the custom design.");
      });
  };

  // Add custom layout directly to checkout cart
  const handleAddToCart = () => {
    if (!fabricCanvas) return;
    
    const previewPng = fabricCanvas.toDataURL({ format: "png", quality: 1.0 });
    
    const baseMockImage = selectedColor.hex === "#f4f4f7" 
      ? "/images/products/blank_tee_white.png" 
      : "/images/products/blank_tee_black.png";

    addToCart({
      product_id: "custom-tshirt-canvas",
      title: `Custom ${selectedColor.name} Heavyweight Tee`,
      image: baseMockImage,
      custom_design_id: `custom_${Date.now()}`,
      canvas_preview: previewPng,
      quantity: 1,
      size: "M",
      color: selectedColor.hex,
      price: 899.00 // Custom t-shirts premium flat price
    });
    
    showCustomToast("Successfully added your customized streetwear garment to your bag!");
  };

  const filteredColors = colorCategory === "All" ? SHIRT_COLORS : SHIRT_COLORS.filter(c => c.category === colorCategory);
  const fontsInCategory = FONT_CATEGORIES[fontCategory] || [];

  return (
    <main className="min-h-screen bg-[#faf8f5] text-zinc-950 pt-20 flex flex-col">
      <div className="max-w-7xl mx-auto px-6 py-8 w-full flex-grow flex flex-col md:flex-row items-start gap-8">
        
        {/* LEFT WORKSPACE PANELS */}
        <div className="w-full md:w-[340px] flex flex-col gap-4">
          <div className="border border-zinc-200 bg-white p-5 space-y-5">
            <h2 className="text-sm font-black uppercase tracking-widest text-zinc-900 font-serif">Designer Studio</h2>
            
            {/* Tab selection links */}
            <div className="flex border-b border-zinc-200 gap-4 text-[10px] font-extrabold uppercase tracking-widest text-zinc-400">
              {(["color","text","upload"] as const).map((tab, i) => (
                <button key={tab} onClick={() => setActiveTab(tab)}
                  className={`pb-2 transition-colors ${activeTab === tab ? "text-[#7a1c27] border-b-2 border-[#7a1c27]" : "hover:text-zinc-700"}`}>
                  {i+1}. {tab === "color" ? "Garment" : tab === "text" ? "Text" : "Art"}
                </button>
              ))}
            </div>

            {/* GARMENT COLOR TAB */}
            {activeTab === "color" && (
              <div className="space-y-3">
                {/* Category filters */}
                <div className="flex flex-wrap gap-1.5">
                  {COLOR_CATEGORIES.map(cat => (
                    <button key={cat} onClick={() => setColorCategory(cat)}
                      className={`px-2 py-0.5 text-[8px] font-black uppercase tracking-widest border rounded-none transition-all ${
                        colorCategory === cat ? "bg-[#7a1c27] border-[#7a1c27] text-white" : "border-zinc-200 text-zinc-500 hover:border-zinc-400"
                      }`}>{cat}</button>
                  ))}
                </div>
                {/* Color swatches */}
                <div className="grid grid-cols-5 gap-2">
                  {filteredColors.map((c) => (
                    <button key={c.name} onClick={() => setSelectedColor(c)}
                      title={c.name}
                      className={`h-9 w-full rounded-none border-2 transition-all ${
                        selectedColor.name === c.name ? "border-[#7a1c27] scale-105 shadow-md" : "border-zinc-200 hover:border-zinc-400"
                      }`}
                      style={{ backgroundColor: c.hex }}
                    />
                  ))}
                </div>
                <div className="flex items-center space-x-2 pt-1 border-t border-zinc-100">
                  <div className="w-5 h-5 border border-zinc-300" style={{ backgroundColor: selectedColor.hex }} />
                  <span className="text-[9px] font-black uppercase tracking-widest text-zinc-600">{selectedColor.name}</span>
                  <span className="text-[9px] font-mono text-zinc-400 ml-auto">{selectedColor.hex}</span>
                </div>
              </div>
            )}

            {/* TEXT TAB */}
            {activeTab === "text" && (
              <div className="space-y-4">
                {/* Style Presets */}
                <div className="space-y-1.5">
                  <label className="text-[8px] font-black uppercase tracking-widest text-zinc-400">Style Presets</label>
                  <div className="grid grid-cols-2 gap-1.5">
                    {TEXT_STYLE_PRESETS.map(preset => (
                      <button key={preset.name} onClick={() => applyTextStylePreset(preset)}
                        className="px-2.5 py-2.5 bg-[#faf8f5] hover:bg-white border border-zinc-200 hover:border-[#7a1c27] text-[10px] tracking-wider text-zinc-800 transition-all text-left rounded-none flex items-center justify-between shadow-xs hover:shadow-sm"
                        style={{ 
                          fontFamily: preset.fontFamily, 
                          fontWeight: preset.fontWeight, 
                          fontStyle: preset.fontStyle,
                        }}>
                        <span>{preset.name}</span>
                        <span className="text-[7.5px] opacity-40 font-sans tracking-widest uppercase ml-1 block">{preset.fontFamily.split(' ')[0]}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Styled Font Selection Dropdown */}
                <div className="space-y-1.5 relative">
                  <label className="text-[8px] font-black uppercase tracking-widest text-zinc-400">Selected Font Style</label>
                  
                  <button 
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsFontDropdownOpen(!isFontDropdownOpen);
                    }}
                    className="w-full px-3 py-2.5 bg-[#faf8f5] hover:bg-white border border-zinc-200 hover:border-[#7a1c27] text-left rounded-none flex items-center justify-between text-xs font-semibold text-zinc-800 transition-all shadow-xs"
                  >
                    <span style={{ fontFamily: fontFamily }} className="text-sm font-medium">{fontFamily}</span>
                    <ChevronDown className={`w-4 h-4 text-zinc-500 transition-transform ${isFontDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {/* Backdrop overlay for closing dropdown on outside clicks */}
                  {isFontDropdownOpen && (
                    <div className="fixed inset-0 z-20" onClick={() => setIsFontDropdownOpen(false)} />
                  )}

                  {isFontDropdownOpen && (
                    <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-zinc-200 shadow-xl z-30 max-h-64 overflow-y-auto rounded-none py-1">
                      {Object.entries(FONT_CATEGORIES).map(([cat, fonts]) => (
                        <div key={cat} className="space-y-0.5">
                          <div className="px-3 py-1 bg-zinc-50 text-[8px] font-black uppercase tracking-widest text-[#7a1c27] border-y border-zinc-150/40">
                            {cat}
                          </div>
                          {fonts.map(f => (
                            <button
                              key={f}
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setFontFamily(f);
                                if (selectedObject) updateTextProp(f, "font");
                                setIsFontDropdownOpen(false);
                              }}
                              className={`w-full px-4 py-2.5 text-left transition-colors flex items-center justify-between hover:bg-zinc-50 ${
                                fontFamily === f ? "bg-[#7a1c27]/5 text-[#7a1c27] font-semibold" : "text-zinc-800"
                              }`}
                            >
                              <span className="text-sm font-medium" style={{ fontFamily: f }}>{f}</span>
                              <span className="text-xs opacity-60 font-mono tracking-widest" style={{ fontFamily: f }}>Aa</span>
                            </button>
                          ))}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Font Size Slider */}
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <label className="text-[8px] font-black uppercase tracking-widest text-zinc-400">Size</label>
                    <span className="text-[9px] font-mono font-bold text-[#7a1c27]">{fontSize}px</span>
                  </div>
                  <input type="range" min={10} max={72} value={fontSize}
                    onChange={e => { setFontSize(+e.target.value); if(selectedObject) updateTextProp(+e.target.value, "size"); }}
                    className="w-full accent-[#7a1c27] h-1" />
                </div>

                {/* Text Arching / Curve Slider */}
                <div className="space-y-1.5 pt-1">
                  <div className="flex justify-between items-center">
                    <label className="text-[8px] font-black uppercase tracking-widest text-zinc-400">Text Arch / Curve</label>
                    <span className="text-[9px] font-mono font-bold text-[#7a1c27]">
                      {textCurve === 0 ? "Flat" : textCurve > 0 ? `Arch Up (${textCurve}%)` : `Arch Down (${Math.abs(textCurve)}%)`}
                    </span>
                  </div>
                  <input 
                    type="range" 
                    min={-40} 
                    max={40} 
                    value={textCurve}
                    disabled={isCircularText}
                    onChange={e => {
                      const val = +e.target.value;
                      setTextCurve(val);
                      if (selectedObject) updateTextProp(val, "curve");
                    }}
                    className="w-full accent-[#7a1c27] h-1 cursor-pointer disabled:opacity-40" 
                  />
                  <div className="flex justify-between text-[7px] font-bold text-zinc-400 uppercase tracking-wider px-0.5">
                    <span>Arch Down</span>
                    <span>Flat</span>
                    <span>Arch Up</span>
                  </div>
                </div>

                {/* 360° Circular Badge Layout Option */}
                <div className="space-y-2 pt-2 border-t border-zinc-100">
                  <div className="flex items-center justify-between">
                    <label className="text-[8px] font-black uppercase tracking-widest text-zinc-400">Circular Badge (360° Loop)</label>
                    <button 
                      type="button"
                      onClick={() => {
                        const newCirc = !isCircularText;
                        setIsCircularText(newCirc);
                        if (selectedObject) updateTextProp(newCirc, "circular");
                      }}
                      className={`px-3 py-1 text-[8.5px] font-black uppercase tracking-wider border rounded-none transition-all ${
                        isCircularText 
                          ? "bg-[#7a1c27] border-[#7a1c27] text-white" 
                          : "border-zinc-200 text-zinc-500 hover:border-zinc-350 bg-white"
                      }`}
                    >
                      {isCircularText ? "Enabled" : "Disabled"}
                    </button>
                  </div>

                  {isCircularText && (
                    <div className="space-y-1 pt-1.5">
                      <div className="flex justify-between items-center">
                        <span className="text-[7.5px] font-black uppercase tracking-widest text-zinc-400">Badge Circle Radius</span>
                        <span className="text-[9px] font-mono font-bold text-[#7a1c27]">{circleRadius}px</span>
                      </div>
                      <input 
                        type="range" 
                        min={40} 
                        max={130} 
                        value={circleRadius}
                        onChange={e => {
                          const val = +e.target.value;
                          setCircleRadius(val);
                          if (selectedObject) updateTextProp(val, "radius");
                        }}
                        className="w-full accent-[#7a1c27] h-1 cursor-pointer" 
                      />
                      <div className="flex justify-between text-[7px] font-bold text-zinc-400 uppercase tracking-wider px-0.5">
                        <span>Small</span>
                        <span>Medium</span>
                        <span>Large</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Style toggles */}
                <div className="flex gap-2">
                  {[{label:"B",type:"bold",active:isBold,style:"font-black"},{label:"I",type:"italic",active:isItalic,style:"italic"},{label:"U",type:"underline",active:isUnderline,style:"underline"}].map(t => (
                    <button key={t.type} onClick={() => updateTextProp("", t.type)}
                      className={`flex-1 py-1.5 border text-xs rounded-none transition-all ${t.active ? "bg-[#7a1c27] border-[#7a1c27] text-white" : "border-zinc-200 text-zinc-600 hover:border-zinc-400"} ${t.style}`}>
                      {t.label}
                    </button>
                  ))}
                  <button onClick={() => updateTextProp("", "shadow")}
                    className={`flex-1 py-1.5 border text-[9px] font-black rounded-none transition-all ${hasShadow ? "bg-[#7a1c27] border-[#7a1c27] text-white" : "border-zinc-200 text-zinc-600"}`}>
                    SHD
                  </button>
                </div>

                {/* Text Align */}
                <div className="flex gap-1">
                  {(["left","center","right"] as const).map(a => (
                    <button key={a} onClick={() => updateTextProp(a, "align")}
                      className={`flex-1 py-1.5 border text-[9px] font-black uppercase rounded-none transition-all ${textAlign === a ? "bg-[#7a1c27] border-[#7a1c27] text-white" : "border-zinc-200 text-zinc-500"}`}>
                      {a}
                    </button>
                  ))}
                </div>

                {/* Text Color */}
                <div className="space-y-1">
                  <label className="text-[8px] font-black uppercase tracking-widest text-zinc-400">Text Color</label>
                  <div className="flex items-center space-x-2">
                    <input type="color" value={textColor}
                      onChange={e => { setTextColor(e.target.value); if(selectedObject) updateTextProp(e.target.value, "color"); }}
                      className="w-10 h-8 cursor-pointer rounded-none border border-zinc-200" />
                    <span className="text-[9px] font-mono text-zinc-500">{textColor}</span>
                  </div>
                </div>

                <button onClick={addText}
                  className="w-full py-2.5 bg-[#7a1c27] hover:bg-[#8e2430] text-white text-[10px] font-black uppercase tracking-widest flex items-center justify-center space-x-2 transition-all">
                  <Type className="w-4 h-4" />
                  <span>Add Text to Canvas</span>
                </button>
              </div>
            )}

            {activeTab === "upload" && (
              <div className="space-y-5">
                <div className="space-y-2">
                  <label className="text-[9px] uppercase font-bold text-zinc-500 tracking-wider block">Premium Street Assets</label>
                  <div className="grid grid-cols-2 gap-2">
                    {PRESET_GRAPHICS.map((g) => (
                      <button
                        key={g.name}
                        type="button"
                        onClick={() => addPresetGraphic(g.url)}
                        className="p-2 border border-zinc-150 hover:border-[#7a1c27] rounded-none bg-white transition-all text-left flex flex-col items-center justify-center space-y-1.5 group"
                      >
                        <img src={g.url} alt={g.name} className="w-12 h-12 object-contain group-hover:scale-105 transition-transform" />
                        <span className="text-[8px] uppercase font-extrabold text-zinc-500 tracking-wider text-center block w-full truncate">{g.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="relative flex py-1 items-center">
                  <div className="flex-grow border-t border-zinc-100/80"></div>
                  <span className="flex-shrink mx-2 text-[8px] uppercase font-extrabold text-zinc-400 tracking-wider">or upload custom</span>
                  <div className="flex-grow border-t border-zinc-100/80"></div>
                </div>

                <label className="w-full py-4 bg-zinc-50 border border-dashed border-zinc-200 hover:border-[#7a1c27]/40 rounded-none flex flex-col items-center justify-center cursor-pointer transition-all space-y-1.5">
                  <Upload className="w-6 h-6 text-zinc-400" />
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#7a1c27]">Upload Custom Image</span>
                  <span className="text-[9px] text-zinc-400">PNG, JPG, SVG supported</span>
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={handleImageUpload} 
                    className="hidden" 
                  />
                </label>
              </div>
            )}
          </div>

          {/* ACTIVE LAYERS PANEL */}
          <div className="border border-zinc-200 bg-white p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-150 pb-2">
              <h4 className="text-xs font-bold uppercase text-zinc-800 tracking-wider flex items-center space-x-1.5 font-serif">
                <Layers className="w-3.5 h-3.5 text-[#7a1c27]" />
                <span>Garment Layers</span>
              </h4>
              <span className="text-[9px] font-black uppercase tracking-widest text-zinc-400 bg-zinc-100 px-2 py-0.5 font-mono">
                {canvasLayers.length} Layers
              </span>
            </div>

            {canvasLayers.length === 0 ? (
              <p className="text-[9px] text-zinc-400 uppercase tracking-widest text-center py-4 font-bold">
                No active canvas layers.
              </p>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                {canvasLayers.map((layer) => {
                  const isSelected = selectedObject === layer.ref;
                  return (
                    <div 
                      key={layer.id} 
                      className={`p-2 border transition-all flex flex-col gap-2 group ${
                        isSelected 
                          ? "border-[#7a1c27] bg-[#7a1c27]/5" 
                          : "border-zinc-150 hover:border-zinc-300 bg-[#fdfdfd]"
                      }`}
                    >
                      {/* Primary Info & Quick Actions */}
                      <div className="flex items-center justify-between gap-2 w-full">
                        <button 
                          onClick={() => selectLayerObject(layer.ref)}
                          className="flex-grow min-w-0 text-left flex items-center space-x-2 cursor-pointer"
                        >
                          {layer.type === "i-text" ? (
                            <Type className="w-3.5 h-3.5 text-zinc-500 flex-shrink-0" />
                          ) : (
                            <Upload className="w-3.5 h-3.5 text-zinc-500 flex-shrink-0" />
                          )}
                          <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-700 truncate w-full block">
                            {layer.text}
                          </span>
                        </button>

                        <div className="flex items-center space-x-1.5 flex-shrink-0">
                          {/* Lock coordinate */}
                          <button 
                            onClick={() => toggleLayerLock(layer.ref)}
                            title={layer.locked ? "Unlock layer" : "Lock layer"}
                            className={`p-1 transition-colors ${layer.locked ? "text-amber-600 hover:text-amber-800" : "text-zinc-350 hover:text-zinc-500"}`}
                          >
                            {layer.locked ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3" />}
                          </button>
                          {/* Visibility toggler */}
                          <button 
                            onClick={() => toggleLayerVisibility(layer.ref)}
                            title={layer.visible ? "Hide layer" : "Show layer"}
                            className={`p-1 transition-colors ${layer.visible ? "text-indigo-600 hover:text-[#7a1c27]" : "text-zinc-350 hover:text-zinc-400"}`}
                          >
                            {layer.visible ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                          </button>
                        </div>
                      </div>

                      {/* Selected Layer Action Toolbar (Only shown when active/selected!) */}
                      {isSelected && (
                        <div className="flex flex-wrap items-center justify-between border-t border-zinc-200/50 pt-2 gap-1 w-full bg-white/40 p-1">
                          <div className="flex items-center space-x-1">
                            <button 
                              onClick={() => moveLayerIndex(layer.ref, "up")}
                              title="Move Layer Up"
                              className="p-1 hover:bg-zinc-100 hover:text-[#7a1c27] text-zinc-500 transition-colors"
                            >
                              <ArrowUp className="w-3 h-3" />
                            </button>
                            <button 
                              onClick={() => moveLayerIndex(layer.ref, "down")}
                              title="Move Layer Down"
                              className="p-1 hover:bg-zinc-100 hover:text-[#7a1c27] text-zinc-500 transition-colors"
                            >
                              <ArrowDown className="w-3 h-3" />
                            </button>
                          </div>

                          <div className="flex items-center space-x-1 ml-auto">
                            <button 
                              onClick={centerObjectH}
                              title="Center Horizontally"
                              className="px-1.5 py-0.5 border border-zinc-200 hover:border-[#7a1c27] text-[8px] font-black uppercase tracking-widest text-zinc-600 bg-white cursor-pointer transition-all"
                            >
                              Center H
                            </button>
                            <button 
                              onClick={centerObjectV}
                              title="Center Vertically"
                              className="px-1.5 py-0.5 border border-zinc-200 hover:border-[#7a1c27] text-[8px] font-black uppercase tracking-widest text-zinc-600 bg-white cursor-pointer transition-all"
                            >
                              Center V
                            </button>
                            <button 
                              onClick={duplicateObject}
                              title="Duplicate Layer"
                              className="px-1.5 py-0.5 border border-zinc-200 hover:border-emerald-600 text-[8px] font-black uppercase tracking-widest text-zinc-600 bg-white cursor-pointer transition-all"
                            >
                              Copy
                            </button>
                            <button 
                              onClick={deleteSelected}
                              title="Delete Layer"
                              className="px-1.5 py-0.5 border border-rose-200 hover:border-rose-600 hover:bg-rose-50 text-[8px] font-black uppercase tracking-widest text-rose-600 cursor-pointer transition-all"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* ACTIVE SELECTED OBJECT CONTROLLER PANEL */}
          {selectedObject && selectedObject.type === "i-text" && (
            <div className="glass-panel p-6 rounded-lg space-y-4">
              <h4 className="text-xs font-bold uppercase text-zinc-500 tracking-wider flex items-center space-x-1.5">
                <Layers className="w-3.5 h-3.5 text-[#7a1c27]" />
                <span>Text Layer Options</span>
              </h4>

              <div className="space-y-3">
                <label className="text-[10px] uppercase font-bold text-zinc-400 block">Edit Text Copy</label>
                <input 
                  type="text" 
                  value={textInput} 
                  onChange={(e) => updateTextProp(e.target.value, "text")}
                  className="w-full px-3 py-2 bg-white border border-zinc-200 text-xs text-zinc-950 rounded-none focus:outline-none focus:border-[#7a1c27]"
                />
              </div>

              <div className="space-y-3 relative">
                <label className="text-[10px] uppercase font-bold text-zinc-400 block">Font Family</label>
                <div className="relative">
                  <button 
                    type="button"
                    onClick={() => setIsFontDropdownOpen(!isFontDropdownOpen)}
                    className="w-full px-3 py-2 bg-white border border-zinc-200 text-xs text-zinc-700 rounded-none focus:outline-none focus:border-[#7a1c27] text-left flex justify-between items-center transition-all hover:border-zinc-450"
                  >
                    <span style={{ fontFamily: fontFamily }} className="text-sm font-medium text-zinc-800">{fontFamily}</span>
                    <span className="text-[10px] text-zinc-400 transition-transform duration-200" style={{ transform: isFontDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}>▼</span>
                  </button>
                  {isFontDropdownOpen && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setIsFontDropdownOpen(false)} />
                      <div className="absolute left-0 right-0 mt-1 max-h-64 overflow-y-auto bg-white border border-zinc-200 z-50 shadow-xl divide-y divide-zinc-100">
                        {FONTS_LIST.map((f) => (
                          <button
                            key={f}
                            type="button"
                            onClick={() => {
                              setFontFamily(f);
                              updateTextProp(f, "font");
                              setIsFontDropdownOpen(false);
                            }}
                            className={`w-full px-3 py-2.5 text-left hover:bg-zinc-50 flex justify-between items-center transition-colors ${
                              fontFamily === f ? "bg-[#7a1c27]/5 text-[#7a1c27]" : "text-zinc-800"
                            }`}
                          >
                            <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">{f}</span>
                            <span style={{ fontFamily: f }} className="text-sm text-right pr-2">{f}</span>
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] uppercase font-bold text-zinc-400 block">Text Fill Color</label>
                <input 
                  type="color" 
                  value={textColor} 
                  onChange={(e) => updateTextProp(e.target.value, "color")}
                  className="w-full h-8 bg-transparent cursor-pointer rounded border border-zinc-200"
                />
              </div>

              <button 
                onClick={deleteSelected}
                className="w-full py-2 bg-rose-500/10 hover:bg-rose-500 text-rose-600 hover:text-white rounded border border-rose-200 text-xs uppercase font-extrabold tracking-widest flex items-center justify-center space-x-2 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                <span>Delete Layer</span>
              </button>
            </div>
          )}

          {selectedObject && selectedObject.type === "image" && (
            <div className="glass-panel p-6 rounded-lg space-y-4">
              <h4 className="text-xs font-bold uppercase text-zinc-500 tracking-wider flex items-center space-x-1.5">
                <Layers className="w-3.5 h-3.5 text-[#7a1c27]" />
                <span>Logo Layer Options</span>
              </h4>
              <p className="text-[11px] text-zinc-400">Drag bounding handles on the canvas element to scale or rotate.</p>
              
              <button 
                onClick={deleteSelected}
                className="w-full py-2 bg-rose-500/10 hover:bg-rose-500 text-rose-600 hover:text-white rounded border border-rose-200 text-xs uppercase font-extrabold tracking-widest flex items-center justify-center space-x-2 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                <span>Delete Layer</span>
              </button>
            </div>
          )}
        </div>

        {/* CENTER INTERACTIVE DESIGN CANVAS WORKSPACE */}
        <div className="flex-1 flex flex-col items-center justify-center w-full">
          
          {/* Elegant Interactive Onboarding Tracker */}
          <div className="hidden sm:flex justify-between w-full max-w-lg mb-4 bg-white border border-zinc-200 p-3 shadow-xs">
            <div className="flex items-center gap-1.5">
              <span className="w-4 h-4 rounded-full bg-[#7a1c27] text-white flex items-center justify-center text-[9px] font-black">1</span>
              <span className="text-[9px] font-black uppercase tracking-widest text-[#7a1c27]">Color</span>
            </div>
            <div className="w-8 h-px bg-zinc-200 self-center" />
            <div className="flex items-center gap-1.5">
              <span className="w-4 h-4 rounded-full bg-[#7a1c27] text-white flex items-center justify-center text-[9px] font-black">2</span>
              <span className="text-[9px] font-black uppercase tracking-widest text-[#7a1c27]">Design</span>
            </div>
            <div className="w-8 h-px bg-zinc-200 self-center" />
            <div className="flex items-center gap-1.5">
              <span className="w-4 h-4 rounded-full border border-zinc-300 text-zinc-400 flex items-center justify-center text-[9px] font-black">3</span>
              <span className="text-[9px] font-black uppercase tracking-widest text-zinc-400">Save Mockup</span>
            </div>
            <div className="w-8 h-px bg-zinc-200 self-center" />
            <div className="flex items-center gap-1.5">
              <span className="w-4 h-4 rounded-full border border-zinc-300 text-zinc-400 flex items-center justify-center text-[9px] font-black">4</span>
              <span className="text-[9px] font-black uppercase tracking-widest text-zinc-400">Order Drop</span>
            </div>
          </div>

          {/* Header toolbar */}
          <div className="flex justify-between w-full max-w-[450px] mb-3 text-xs font-bold uppercase text-zinc-450 tracking-widest px-4">
            <span className="flex items-center space-x-2">
              <ZoomIn className="w-4 h-4 text-zinc-450" />
              <span>Print Zone ({currentView})</span>
            </span>
            <button 
              onClick={toggleView}
              className="flex items-center space-x-1.5 hover:text-[#7a1c27] text-zinc-500 transition-colors cursor-pointer"
            >
              <ArrowLeftRight className="w-4 h-4 text-[#7a1c27]" />
              <span>Flip to {currentView === "front" ? "Back" : "Front"}</span>
            </button>
          </div>

          {/* Interactive Colored garment with absolute canvas boundaries overlays */}
          <div 
            className="w-full max-w-[450px] aspect-[5/6] md:w-[450px] md:h-[540px] md:aspect-auto rounded-none relative flex items-center justify-center transition-colors duration-500 shadow-sm border border-zinc-200 bg-[#f5f2eb] overflow-hidden select-none shrink-0"
            style={{ backgroundColor: selectedColor.hex }}
          >
            {/* Illustrated heavy boxy streetwear T-Shirt silhouette backdrop */}
            <svg className="absolute inset-0 w-full h-full p-4 pointer-events-none select-none z-0" viewBox="0 0 100 100">
              {/* Outer shape of T-Shirt - robust line */}
              <path d="M 50 15 C 44 15 38 18 38 18 L 22 25 L 14 42 L 23 46 L 27 37 L 27 88 L 73 88 L 73 37 L 77 46 L 86 42 L 78 25 L 62 18 C 62 18 56 15 50 15 Z" fill="none" stroke="#1f1f23" strokeWidth="1.8" opacity="0.9" />
              {/* Collar details */}
              <path d="M 38 18 C 38 18 44 21 50 21 C 56 21 62 18 62 18" fill="none" stroke="#1f1f23" strokeWidth="1.5" opacity="0.9" />
              {/* Collar upper arch */}
              <path d="M 50 15 C 54.5 15 58.5 17 60 18.5 C 54.5 21 45.5 21 40 18.5 C 41.5 17 45.5 15 50 15 Z" fill="none" stroke="#1f1f23" strokeWidth="1.2" opacity="0.75" />
              {/* Shoulder creases */}
              <path d="M 33 42 C 33 42 35 60 33 75" fill="none" stroke="#1f1f23" strokeWidth="0.8" opacity="0.5" />
              <path d="M 67 42 C 67 42 65 60 67 75" fill="none" stroke="#1f1f23" strokeWidth="0.8" opacity="0.5" />
              {/* Sleeve seam stitches */}
              <path d="M 27 37 L 22 25" fill="none" stroke="#1f1f23" strokeWidth="1.0" opacity="0.6" strokeDasharray="1.5,1.5" />
              <path d="M 73 37 L 78 25" fill="none" stroke="#1f1f23" strokeWidth="1.0" opacity="0.6" strokeDasharray="1.5,1.5" />
            </svg>

            {/* Printable canvas bounding boxes overlay */}
            <div className="w-full max-w-[320px] aspect-[4/5] md:w-[320px] md:h-[400px] md:aspect-auto border border-dashed border-[#7a1c27]/50 rounded-none relative z-10 bg-zinc-550/5 flex items-center justify-center shadow-xs">
              <canvas id="designer-canvas" ref={canvasRef} />
              
              {/* Visual Watermark empty placeholder helper */}
              {objectsCount === 0 && (
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-zinc-400/40 select-none z-0">
                  <Type className="w-8 h-8 mb-2 stroke-[1.5]" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-center px-6">Print Zone Active</span>
                  <span className="text-[8px] uppercase tracking-wider mt-1 text-center px-8">Drag designs here or select layers from sidebar</span>
                </div>
              )}
            </div>
          </div>

          {/* Canvas Studio action builders */}
          <div className="flex items-center gap-4 mt-8 w-full max-w-[450px] px-4">
            <button 
              onClick={handleSaveDesign}
              className="flex-1 py-3 bg-white border border-zinc-200 hover:border-zinc-350 text-zinc-700 font-extrabold text-xs uppercase tracking-widest rounded-none flex items-center justify-center space-x-2 transition-all shadow-sm"
            >
              <Save className="w-4.5 h-4.5" />
              <span>Save Mockup Template</span>
            </button>

            <button 
              onClick={handleAddToCart}
              className="flex-1 py-3 bg-[#7a1c27] hover:bg-[#8e2430] text-white font-extrabold text-xs uppercase tracking-widest rounded-none flex items-center justify-center space-x-2 transition-all shadow-md"
            >
              <ShoppingBag className="w-4.5 h-4.5" />
              <span>Add custom to bag</span>
            </button>
          </div>
        </div>

      </div>

      {/* Premium Luxury Toast Notification */}
      <AnimatePresence>
        {toast.show && (
          <motion.div 
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 bg-[#faf8f5] border-2 border-[#7a1c27] shadow-2xl p-5 text-center max-w-sm w-full font-serif flex flex-col items-center space-y-3 rounded-none"
          >
            <div className="w-10 h-10 rounded-full bg-[#7a1c27]/10 flex items-center justify-center text-[#7a1c27]">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h4 className="text-xs uppercase font-extrabold tracking-widest text-[#7a1c27]">BAG UPDATED</h4>
              <p className="text-[11px] uppercase tracking-wider text-zinc-700 font-sans font-bold leading-relaxed">
                {toast.message}
              </p>
            </div>
            <div className="w-full bg-zinc-200 h-0.5 relative overflow-hidden">
              <motion.div 
                initial={{ width: "100%" }}
                animate={{ width: 0 }}
                transition={{ duration: 4, ease: "linear" }}
                className="absolute left-0 top-0 h-full bg-[#7a1c27]"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        .canvas-container {
          max-width: 100% !important;
          height: auto !important;
        }
        .lower-canvas, .upper-canvas {
          max-width: 100% !important;
          height: auto !important;
        }
      `}</style>
    </main>
  );
}

export default function CustomizePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#faf8f5] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#7a1c27] border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <CustomizePageContent />
    </Suspense>
  );
}
