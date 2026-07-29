import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { 
  Hammer, Compass, Award, Phone, ShieldCheck, Mail, 
  MapPin, Send, Cpu, CheckCircle, ChevronRight, Lock, 
  Eye, Trash2, Calendar, FileText, Check, Database, 
  RefreshCw, BarChart2, UserCheck, Menu, X, ArrowUpRight,
  Printer, HardDrive, AlertTriangle, Layers, Clock, Settings,
  BookOpen, FileSpreadsheet, Search, MessageCircle, Bot, ArrowUp, Sun, Moon, Briefcase, Edit3, Folder, Users, Image, Calculator, User, Save, Camera, ChevronDown
} from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, Tooltip, useMap, GeoJSON, ZoomControl } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { translations } from './translations';

function MapFlyTo({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.flyTo(center, zoom || 12, { animate: true, duration: 1.5 });
    }
  }, [center, zoom, map]);
  return null;
}

const customGlowIcon = new L.divIcon({
  className: 'custom-glow-icon',
  html: `<div class="pulse-marker" style="background-color: var(--color-cyan); box-shadow: 0 0 10px var(--color-cyan), 0 0 20px var(--color-cyan);"></div>`,
  iconSize: [20, 20],
  iconAnchor: [10, 10]
});

// Soil types for calculations
const SOILS = {
  sand: { name: 'РџРµСЃРѕРє (РџРµСЃС‡Р°РЅС‹Р№ РіСЂСѓРЅС‚)', coeff: 1.0, color: 'rgba(59, 130, 246, 0.15)', desc: 'Р›РµРіРєРѕ Р±СѓСЂРёС‚СЃСЏ, С‚СЂРµР±СѓРµС‚ РѕР±СЃР°РґРєРё СЃРєРІР°Р¶РёРЅ РѕС‚ РѕСЃС‹РїР°РЅРёСЏ.', minDepth: 5, spec: 'РЎРџ Р Рљ 1.02-104-2020 РџСЂРёР». Рђ' },
  clay: { name: 'Р“Р»РёРЅР° (Р“Р»РёРЅРёСЃС‚С‹Р№ РіСЂСѓРЅС‚)', coeff: 1.2, color: 'rgba(180, 83, 9, 0.15)', desc: 'Р’С‹СЃРѕРєР°СЏ Р»РёРїРєРѕСЃС‚СЊ, РїСЂРѕС‡РЅС‹Рµ СЃРєРІР°Р¶РёРЅС‹, С‚СЂРµР±СѓРµС‚СЃСЏ С‚РѕС‡РЅРѕРµ Р»Р°Р±РѕСЂР°С‚РѕСЂРЅРѕРµ РѕРїСЂРµРґРµР»РµРЅРёРµ РєРѕРЅСЃРёСЃС‚РµРЅС†РёРё.', minDepth: 8, spec: 'РЎРџ Р Рљ 1.02-104-2020 РџСЂРёР». Р‘' },
  loam: { name: 'РЎСѓРіР»РёРЅРѕРє (РЎРјРµС€Р°РЅРЅС‹Р№ РіСЂСѓРЅС‚)', coeff: 1.1, color: 'rgba(120, 53, 4, 0.15)', desc: 'РЎРјРµС€Р°РЅРЅС‹Р№ С‚РёРї, СЃСЂРµРґРЅСЏСЏ СЃС‚РµРїРµРЅСЊ СЃР»РѕР¶РЅРѕСЃС‚Рё Р±СѓСЂРµРЅРёСЏ.', minDepth: 6, spec: 'РЎРџ Р Рљ 1.02-104-2020 РџСЂРёР». Р’' },
  rock: { name: 'РЎРєР°Р»СЊРЅС‹Р№ РіСЂСѓРЅС‚ (РџСЂРѕС‡РЅС‹Р№)', coeff: 2.5, color: 'rgba(100, 116, 139, 0.2)', desc: 'РџРѕРІС‹С€РµРЅРЅР°СЏ РїСЂРѕС‡РЅРѕСЃС‚СЊ, С‚СЂРµР±СѓРµС‚СЃСЏ Р±СѓСЂРѕРІС‹Рµ РєРѕСЂРѕРЅРєРё РїРѕРІС‹С€РµРЅРЅРѕР№ С‚РІРµСЂРґРѕСЃС‚Рё (Bauer BG20/BG28).', minDepth: 15, spec: 'РЎРџ Р Рљ 1.02-104-2020 РџСЂРёР». Р“' },
  peat: { name: 'РўРѕСЂС„ (РЎР»Р°Р±С‹Р№ Р·Р°С‚РѕСЂС„РѕРІР°РЅРЅС‹Р№)', coeff: 1.5, color: 'rgba(69, 26, 3, 0.25)', desc: 'РЎР»Р°Р±С‹Р№ РіСЂСѓРЅС‚ СЃ РІС‹СЃРѕРєРѕР№ СЃР¶РёРјР°РµРјРѕСЃС‚СЊСЋ. РўСЂРµР±СѓРµС‚ РіР»СѓР±РѕРєРѕРіРѕ Р·РѕРЅРґРёСЂРѕРІР°РЅРёСЏ.', minDepth: 10, spec: 'РЎРџ Р Рљ 1.02-104-2020 РџСЂРёР». Р”' },
};

// Services sub-items data
const SERVICES_DATA = {
  geology: {
    title: 'РРЅР¶РµРЅРµСЂРЅРѕ-РіРµРѕР»РѕРіРёС‡РµСЃРєРёРµ РёР·С‹СЃРєР°РЅРёСЏ',
    code: 'GEO-01',
    icon: Compass,
    desc: 'Р‘СѓСЂРµРЅРёРµ РёР·С‹СЃРєР°С‚РµР»СЊСЃРєРёС… СЃРєРІР°Р¶РёРЅ, РѕС‚Р±РѕСЂ РјРѕРЅРѕР»РёС‚РѕРІ РіСЂСѓРЅС‚Р° Рё РїСЂРѕР± РїРѕРґР·РµРјРЅС‹С… РІРѕРґ, РїРѕР»РµРІРѕРµ РѕРїРёСЃР°РЅРёРµ РіСЂСѓРЅС‚РѕРІРѕРіРѕ РјР°СЃСЃРёРІР°, РёР·СѓС‡РµРЅРёРµ РѕРїР°СЃРЅС‹С… С„РёР·РёРєРѕ-РіРµРѕР»РѕРіРёС‡РµСЃРєРёС… РїСЂРѕС†РµСЃСЃРѕРІ.',
    reg: 'РЎРџ Р Рљ 1.02-104-2020, Р“РћРЎРў 12071'
  },
  geodesy: {
    title: 'Р“РµРѕРґРµР·РёСЏ Рё С‚РѕРїРѕСЃСЉРµРјРєР°',
    code: 'SUR-02',
    icon: Hammer,
    desc: 'РўРѕРїРѕРіСЂР°С„РёС‡РµСЃРєР°СЏ СЃСЉРµРјРєР° РјР°СЃС€С‚Р°Р±РѕРІ 1:500 - 1:5000 РґР»СЏ РїСЂРѕРµРєС‚РёСЂРѕРІР°РЅРёСЏ, СЃСЉРµРјРєР° РїРѕРґР·РµРјРЅС‹С… РєРѕРјРјСѓРЅРёРєР°С†РёР№, СЃРѕР·РґР°РЅРёРµ РѕРїРѕСЂРЅС‹С… РіРµРѕРґРµР·РёС‡РµСЃРєРёС… СЃРµС‚РµР№, РІС‹РЅРѕСЃ РѕСЃРµР№ Р·РґР°РЅРёР№ РІ РЅР°С‚СѓСЂСѓ.',
    reg: 'РЎРќ Р Рљ 1.02-03-2021'
  },
  cpt: {
    title: 'CPT (РЎС‚Р°С‚РёС‡РµСЃРєРѕРµ Р·РѕРЅРґРёСЂРѕРІР°РЅРёРµ)',
    code: 'CPT-03',
    icon: Layers,
    desc: 'РСЃРїС‹С‚Р°РЅРёРµ РіСЂСѓРЅС‚РѕРІ РЅРµРїСЂРµСЂС‹РІРЅС‹Рј РІРґР°РІР»РёРІР°РЅРёРµРј РєРѕРЅСѓСЃР° СЃ РёР·РјРµСЂРµРЅРёРµРј СЃРѕРїСЂРѕС‚РёРІР»РµРЅРёСЏ qc Рё Р±РѕРєРѕРІРѕРіРѕ С‚СЂРµРЅРёСЏ fs. РџРѕР·РІРѕР»СЏРµС‚ РѕРїРµСЂР°С‚РёРІРЅРѕ СЂР°СЃС‡Р»РµРЅРёС‚СЊ СЂР°Р·СЂРµР· Рё РѕРїСЂРµРґРµР»РёС‚СЊ С…Р°СЂР°РєС‚РµСЂРёСЃС‚РёРєРё.',
    reg: 'Р“РћРЎРў 19912-2012'
  },
  piles: {
    title: 'РСЃРїС‹С‚Р°РЅРёСЏ СЃРІР°Р№',
    code: 'PIL-04',
    icon: ShieldCheck,
    desc: 'РџСЂРѕРІРµРґРµРЅРёРµ РїРѕР»РµРІС‹С… РёСЃРїС‹С‚Р°РЅРёР№ РЅР°С‚СѓСЂРЅС‹С… СЃРІР°Р№ СЃС‚Р°С‚РёС‡РµСЃРєРѕР№ РІРґР°РІР»РёРІР°СЋС‰РµР№, РІС‹РґРµСЂРіРёРІР°СЋС‰РµР№ РёР»Рё РіРѕСЂРёР·РѕРЅС‚Р°Р»СЊРЅРѕР№ РЅР°РіСЂСѓР·РєР°РјРё, Р° С‚Р°РєР¶Рµ РґРёРЅР°РјРёС‡РµСЃРєРёРµ РёСЃРїС‹С‚Р°РЅРёСЏ.',
    reg: 'Р“РћРЎРў 5686-2020'
  },
  plates: {
    title: 'РЁС‚Р°РјРїРѕРІС‹Рµ РёСЃРїС‹С‚Р°РЅРёСЏ',
    code: 'PLT-05',
    icon: Cpu,
    desc: 'РџСЂРѕРІРµРґРµРЅРёРµ РёСЃРїС‹С‚Р°РЅРёР№ РіСЂСѓРЅС‚РѕРІ РїР»РѕСЃРєРёРјРё РєСЂСѓРіР»С‹РјРё С€С‚Р°РјРїР°РјРё РЁР’-60 РІ СЃРєРІР°Р¶РёРЅР°С… Рё С€СѓСЂС„Р°С… РґР»СЏ РїСЂСЏРјРѕРіРѕ РѕРїСЂРµРґРµР»РµРЅРёСЏ РјРѕРґСѓР»СЏ РґРµС„РѕСЂРјР°С†РёРё Р• РЅРµСЃСѓС‰РёС… РіРѕСЂРёР·РѕРЅС‚РѕРІ.',
    reg: 'Р“РћРЎРў 20276.1-2020'
  },
  laboratory: {
    title: 'Р›Р°Р±РѕСЂР°С‚РѕСЂРёСЏ РіСЂСѓРЅС‚РѕРІ',
    code: 'LAB-06',
    icon: Award,
    desc: 'РЎРѕР±СЃС‚РІРµРЅРЅС‹Р№ Р»Р°Р±РѕСЂР°С‚РѕСЂРЅС‹Р№ РєРѕРјРїР»РµРєСЃ: РєРѕРјРїСЂРµСЃСЃРёРѕРЅРЅС‹Рµ СЃР¶Р°С‚РёСЏ, РѕРґРЅРѕРїР»РѕСЃРєРѕСЃС‚РЅС‹Рµ СЃРґРІРёРіРё, РѕРїСЂРµРґРµР»РµРЅРёРµ С„РёР·РёС‡РµСЃРєРёС… СЃРІРѕР№СЃС‚РІ, С…РёРј. Р°РЅР°Р»РёР· РіСЂСѓРЅС‚РѕРІ Рё РІРѕРґ РЅР° Р°РіСЂРµСЃСЃРёРІРЅРѕСЃС‚СЊ Рє Р±РµС‚РѕРЅР°Рј.',
    reg: 'Р“РћРЎРў 5180-2015, Р“РћРЎРў 12248-2020'
  },
  hydrogeology: {
    title: 'Р“РёРґСЂРѕРіРµРѕР»РѕРіРёСЏ',
    code: 'HYD-07',
    icon: Database,
    desc: 'РћРїС‹С‚РЅРѕ-С„РёР»СЊС‚СЂР°С†РёРѕРЅРЅС‹Рµ СЂР°Р±РѕС‚С‹ (РєСѓСЃС‚РѕРІС‹Рµ Рё РѕРґРёРЅРѕС‡РЅС‹Рµ РѕС‚РєР°С‡РєРё РёР· СЃРєРІР°Р¶РёРЅ), СЂР°СЃС‡РµС‚ РїСЂРёС‚РѕРєРѕРІ РІ СЃС‚СЂРѕРёС‚РµР»СЊРЅС‹Рµ РєРѕС‚Р»РѕРІР°РЅС‹, СЂР°Р·СЂР°Р±РѕС‚РєР° СЂРµРєРѕРјРµРЅРґР°С†РёР№ РїРѕ РІРѕРґРѕРїРѕРЅРёР¶РµРЅРёСЋ.',
    reg: 'РЎРџ Р Рљ 1.02-105-2014'
  }
};

// Drill rigs database
const DRILLING_RIGS = [
  {
    name: 'Bauer BG20 / BG28',
    type: 'РўСЏР¶РµР»Р°СЏ Р±СѓСЂРѕРІР°СЏ СѓСЃС‚Р°РЅРѕРІРєР°',
    power: '280-354 РєР’С‚',
    weight: '62-96 С‚РѕРЅРЅ',
    torque: '200-280 РєРќРј',
    maxDepth: '80 Рј',
    soilType: 'Р’СЃРµ С‚РёРїС‹, РІРєР»СЋС‡Р°СЏ СЃРєР°Р»СЊРЅС‹Рµ Рё РєСЂСѓРїРЅРѕРѕР±Р»РѕРјРѕС‡РЅС‹Рµ РїРѕСЂРѕРґС‹',
    description: 'РњРЅРѕРіРѕС„СѓРЅРєС†РёРѕРЅР°Р»СЊРЅР°СЏ Р±СѓСЂРѕРІР°СЏ СѓСЃС‚Р°РЅРѕРІРєР° РґР»СЏ СѓСЃС‚СЂРѕР№СЃС‚РІР° СЃРІР°Р№РЅС‹С… С„СѓРЅРґР°РјРµРЅС‚РѕРІ РіР»СѓР±РѕРєРѕРіРѕ Р·Р°Р»РѕР¶РµРЅРёСЏ. РСЃРїРѕР»СЊР·СѓРµС‚СЃСЏ РґР»СЏ РѕС‚РІРµС‚СЃС‚РІРµРЅРЅС‹С… РіСЂР°Р¶РґР°РЅСЃРєРёС… Р·РґР°РЅРёР№, РјРѕСЃС‚РѕРІ Рё С‚СЏР¶РµР»С‹С… РїСЂРѕРјС‹С€Р»РµРЅРЅС‹С… РѕР±СЉРµРєС‚РѕРІ.',
    mobility: 'РўСЂР°РЅСЃРїРѕСЂС‚РёСЂСѓРµС‚СЃСЏ С‚СЂР°Р»РѕРј',
    cadSpecs: ['[Kelly Bar: 4-fold]', '[Rotary Head KDK 280]', '[Mast Height: 24.5m]', '[Main Winch: 200kN]']
  },
  {
    name: 'РџР‘РЈ-2 РЅР° Р±Р°Р·Рµ РЈР РђР›-4350',
    type: 'РњРѕС‰РЅР°СЏ СЂР°Р·РІРµРґРѕС‡РЅР°СЏ СѓСЃС‚Р°РЅРѕРІРєР°',
    power: '170 РєР’С‚',
    weight: '12.5 С‚РѕРЅРЅ',
    torque: '5.2 РєРќРј',
    maxDepth: '50 Рј',
    soilType: 'РџРµСЃРѕРє, РіР»РёРЅР°, СЃСѓРіР»РёРЅРѕРє, РіСЂР°РІРёР№РЅС‹Рµ РѕС‚Р»РѕР¶РµРЅРёСЏ',
    description: 'РЎР°РјРѕС…РѕРґРЅР°СЏ Р±СѓСЂРѕРІР°СЏ СѓСЃС‚Р°РЅРѕРІРєР° РЅР° Р±Р°Р·Рµ РІРµР·РґРµС…РѕРґРЅРѕРіРѕ С€Р°СЃСЃРё РЈР РђР›. РџСЂРёРјРµРЅСЏРµС‚СЃСЏ РґР»СЏ РіР»СѓР±РѕРєРѕРіРѕ СЂР°Р·РІРµРґРѕС‡РЅРѕРіРѕ Р±СѓСЂРµРЅРёСЏ РІ Р»СЋР±С‹С… РєР»РёРјР°С‚РёС‡РµСЃРєРёС… Р·РѕРЅР°С… РљР°Р·Р°С…СЃС‚Р°РЅР°.',
    mobility: 'Р’РµР·РґРµС…РѕРґРЅРѕРµ С€Р°СЃСЃРё 4С…4',
    cadSpecs: ['[Mast Cylinder: Lift 3.2m]', '[Drill Feed Rate: 1.2m/s]', '[Outriggers: Hydraulic]', '[Chassis: Ural 4x4]']
  },
  {
    name: 'РџР‘РЈ-2-3 РЅР° Р±Р°Р·Рµ РљРђРњРђР—-5350',
    type: 'РЈРЅРёРІРµСЂСЃР°Р»СЊРЅР°СЏ Р±СѓСЂРѕРІР°СЏ СѓСЃС‚Р°РЅРѕРІРєР°',
    power: '180 РєР’С‚',
    weight: '13.2 С‚РѕРЅРЅ',
    torque: '5.5 РєРќРј',
    maxDepth: '50 Рј',
    soilType: 'РЁРёСЂРѕРєРёР№ СЃРїРµРєС‚СЂ СЃРІСЏР·РЅС‹С… Рё СЃС‹РїСѓС‡РёС… РіСЂСѓРЅС‚РѕРІ',
    description: 'РЈРЅРёРІРµСЂСЃР°Р»СЊРЅР°СЏ СѓСЃС‚Р°РЅРѕРІРєР° РґР»СЏ РїРѕР»РµРІС‹С… РёРЅР¶РµРЅРµСЂРЅРѕ-РіРµРѕР»РѕРіРёС‡РµСЃРєРёС… РёР·С‹СЃРєР°РЅРёР№, СЃС‚Р°С‚РёС‡РµСЃРєРѕРіРѕ Рё РґРёРЅР°РјРёС‡РµСЃРєРѕРіРѕ Р·РѕРЅРґРёСЂРѕРІР°РЅРёСЏ РіСЂСѓРЅС‚РѕРІ.',
    mobility: 'РђСЂРјРµР№СЃРєРѕРµ С€Р°СЃСЃРё РљРђРњРђР—',
    cadSpecs: ['[Spindle Speed: 400rpm]', '[Pullup Force: 60kN]', '[Mud Pump: NB-32]', '[Chassis: Kamaz 6x6]']
  },
  {
    name: 'РЈР“Р‘-1Р’РЎ РЅР° Р±Р°Р·Рµ Р“РђР—-66',
    type: 'РњР°РЅРµРІСЂРµРЅРЅР°СЏ Р»РµРіРєР°СЏ СѓСЃС‚Р°РЅРѕРІРєР°',
    power: '88 РєР’С‚',
    weight: '6.2 С‚РѕРЅРЅ',
    torque: '2.5 РєРќРј',
    maxDepth: '25 Рј',
    soilType: 'РњСЏРіРєРёРµ Рё СЃСЂРµРґРЅРµР№ РїР»РѕС‚РЅРѕСЃС‚Рё РїРѕСЂРѕРґС‹',
    description: 'РљРѕРјРїР°РєС‚РЅР°СЏ РјР°РЅРµРІСЂРµРЅРЅР°СЏ СѓСЃС‚Р°РЅРѕРІРєР° РґР»СЏ РёР·С‹СЃРєР°РЅРёР№ РІ СЃС‚РµСЃРЅРµРЅРЅС‹С… РіРѕСЂРѕРґСЃРєРёС… СѓСЃР»РѕРІРёСЏС…, РґР°С‡РЅС‹С… РјР°СЃСЃРёРІР°С… РёР»Рё С‚СЂСѓРґРЅРѕРґРѕСЃС‚СѓРїРЅС‹С… РіРѕСЂРЅС‹С… СЂР°Р№РѕРЅР°С….',
    mobility: 'Р›РµРіРєРёР№ РїРѕР»РЅС‹Р№ РїСЂРёРІРѕРґ Р“РђР—-66',
    cadSpecs: ['[Auger Drilling Type]', '[Mast Type: Folding]', '[Chassis: GAZ-66]', '[Core Barrel: 108mm]']
  }
];

const LAB_EQUIP = [
  {
    name: 'Р“Р•РћРўР•РЎРў-Рљ2 / Рљ4',
    type: 'РљРѕРјРїР»РµРєСЃ СЃС‚Р°С‚РёС‡РµСЃРєРѕРіРѕ Р·РѕРЅРґРёСЂРѕРІР°РЅРёСЏ',
    params: 'РЈСЃРёР»РёРµ РІРґР°РІР»РёРІР°РЅРёСЏ РґРѕ 100/200 РєРќ',
    standard: 'Р“РћРЎРў 19912-2012',
    description: 'РђРІС‚РѕРјР°С‚РёР·РёСЂРѕРІР°РЅРЅС‹Р№ РєРѕРјРїР»РµРєСЃ РґР»СЏ РЅРµРїСЂРµСЂС‹РІРЅРѕРіРѕ Р·РѕРЅРґРёСЂРѕРІР°РЅРёСЏ РіСЂСѓРЅС‚РѕРІ СЃ СЂРµРіРёСЃС‚СЂР°С†РёРµР№ Р»РѕР±РѕРІРѕРіРѕ СЃРѕРїСЂРѕС‚РёРІР»РµРЅРёСЏ Рё С‚СЂРµРЅРёСЏ РїРѕ РјСѓС„С‚Рµ РєРѕРЅСѓСЃР° РІ СЂРµР¶РёРјРµ СЂРµР°Р»СЊРЅРѕРіРѕ РІСЂРµРјРµРЅРё.',
    purpose: 'РћРїСЂРµРґРµР»РµРЅРёРµ РїР»РѕС‚РЅРѕСЃС‚Рё, РјРѕРґСѓР»СЏ РґРµС„РѕСЂРјР°С†РёРё Рё РЅРµСЃСѓС‰РµР№ СЃРїРѕСЃРѕР±РЅРѕСЃС‚Рё СЃРІР°Р№.',
    cadSpecs: ['[Cone Area: 10cmВІ]', '[Friction Sleeve Area: 150cmВІ]', '[Max Force: 200kN]', '[Data Sync: Wireless]']
  },
  {
    name: 'РЁРРќРћР’Р«Р• РЁРўРђРњРџР« РЁР’-60',
    type: 'РСЃРїС‹С‚Р°С‚РµР»СЊРЅС‹Р№ РІРёРЅС‚РѕРІРѕР№ С€С‚Р°РјРї',
    params: 'РџР»РѕС‰Р°РґСЊ 600 РєРІ.СЃРј, РЅР°РіСЂСѓР·РєР° РґРѕ 500 РєРџР°',
    standard: 'Р“РћРЎРў 20276-2012',
    description: 'РЈСЃС‚Р°РЅРѕРІРєР° РґР»СЏ РїСЂРѕРІРµРґРµРЅРёСЏ РїРѕР»РµРІС‹С… С€С‚Р°РјРїРѕРІС‹С… РёСЃРїС‹С‚Р°РЅРёР№ РіСЂСѓРЅС‚РѕРІ РІ Р±СѓСЂРѕРІС‹С… СЃРєРІР°Р¶РёРЅР°С… РЅР° СЂР°Р·Р»РёС‡РЅРѕР№ РіР»СѓР±РёРЅРµ.',
    purpose: 'РЎР°РјС‹Р№ С‚РѕС‡РЅС‹Р№ РјРµС‚РѕРґ РѕРїСЂРµРґРµР»РµРЅРёСЏ РјРѕРґСѓР»СЏ РґРµС„РѕСЂРјР°С†РёРё (Р•) РЅРµРїРѕСЃСЂРµРґСЃС‚РІРµРЅРЅРѕ РІ РјР°СЃСЃРёРІРµ РіСЂСѓРЅС‚Р°.',
    cadSpecs: ['[Screw Anchor Area: 600cmВІ]', '[Hydraulic Jack Stroke: 50mm]', '[Reference Beam System]', '[Digital Indicator]']
  },
  {
    name: 'Р“СЂСѓРЅС‚РѕРІР°СЏ Р»Р°Р±РѕСЂР°С‚РѕСЂРёСЏ РўРћРћ В«РЎРїРµС†РРЅР¶Р“РµРѕВ»',
    type: 'РЎРѕР±СЃС‚РІРµРЅРЅС‹Р№ Р»Р°Р±РѕСЂР°С‚РѕСЂРЅС‹Р№ РєРѕРјРїР»РµРєСЃ',
    params: 'РљРѕРјРїСЂРµСЃСЃРёРѕРЅРЅС‹Рµ РїСЂРёР±РѕСЂС‹, СЃРґРІРёРіРѕРІС‹Рµ РїСЂРёР±РѕСЂС‹ РљРџ-2',
    standard: 'Р“РћРЎРў 5180, Р“РћРЎРў 12248',
    description: 'РџРѕР»РЅС‹Р№ РєРѕРјРїР»РµРєСЃ Р»Р°Р±РѕСЂР°С‚РѕСЂРЅС‹С… РёСЃСЃР»РµРґРѕРІР°РЅРёР№ С„РёР·РёРєРѕ-РјРµС…Р°РЅРёС‡РµСЃРєРёС… Рё С…РёРјРёС‡РµСЃРєРёС… СЃРІРѕР№СЃС‚РІ РіСЂСѓРЅС‚РѕРІ Рё РїРѕРґР·РµРјРЅС‹С… РІРѕРґ. РҐРёРјРёС‡РµСЃРєРёР№ Р°РЅР°Р»РёР· РЅР° Р°РіСЂРµСЃСЃРёРІРЅРѕСЃС‚СЊ Рє Р±РµС‚РѕРЅР°Рј.',
    purpose: 'РћРїСЂРµРґРµР»РµРЅРёРµ СЃС†РµРїР»РµРЅРёСЏ, СѓРіР»Р° РІРЅСѓС‚СЂРµРЅРЅРµРіРѕ С‚СЂРµРЅРёСЏ, РєРѕСЌС„С„РёС†РёРµРЅС‚Р° СЃР¶РёРјР°РµРјРѕСЃС‚Рё.',
    cadSpecs: ['[Compression Cells]', '[Shear Apparatus KP-2]', '[Sieve Shaker Grid]', '[Agilent Water Analyzer]']
  }
];

// Structural Projects list
const DETAILED_PROJECTS = [
  { id: 'bi-skyline', client: 'BI Group', name: 'Р–Рљ В«Skyline AlmatyВ»', type: 'РРЅР¶РµРЅРµСЂРЅР°СЏ РіРµРѕР»РѕРіРёСЏ Рё РіРµРѕРґРµР·РёСЏ', loc: 'Рі. РђР»РјР°С‚С‹', specs: '12 СЃРєРІР°Р¶РёРЅ РїРѕ 35Рј, С€С‚Р°РјРїРѕРІС‹Рµ РёСЃРїС‹С‚Р°РЅРёСЏ РЁР’-60 РІ СЃСѓРіР»РёРЅРєР°С…', year: '2025', coords: [43.2389, 76.8897], image: '/images/rig.png' },
  { id: 'bi-expo', client: 'BI Group', name: 'Р–Рљ В«Expo Boulevard IIIВ»', type: 'РЎС‚Р°С‚РёС‡РµСЃРєРѕРµ Р·РѕРЅРґРёСЂРѕРІР°РЅРёРµ (CPT)', loc: 'Рі. РђСЃС‚Р°РЅР°', specs: '18 С‚РѕС‡РµРє CPT РЅР° РіР»СѓР±РёРЅСѓ 20Рј, РѕРїСЂРµРґРµР»РµРЅРёРµ СЃР¶РёРјР°РµРјРѕСЃС‚Рё', year: '2024', coords: [51.1293, 71.4305], image: '/images/lab.png' },
  { id: 'air-astana-hangar', client: 'Air Astana', name: 'РќРѕРІС‹Р№ Р°РІРёР°С†РёРѕРЅРЅС‹Р№ Р°РЅРіР°СЂ', type: 'РљРѕРјРїР»РµРєСЃРЅС‹Рµ РёР·С‹СЃРєР°РЅРёСЏ', loc: 'РђСЌСЂРѕРїРѕСЂС‚ Рі. РђР»РјР°С‚С‹', specs: 'Р‘СѓСЂРµРЅРёРµ Bauer BG28 РїРѕРґ Р±СѓСЂРѕРЅР°Р±РёРІРЅС‹Рµ СЃРІР°Рё, 45Рј РіР»СѓР±РёРЅС‹', year: '2025', coords: [43.3521, 77.0405], image: '/images/geodesy.png' },
  { id: 'mega-garden-mall', client: 'Mega Garden', name: 'РўР Р¦ В«Mega Garden AlmatyВ»', type: 'Р“РёРґСЂРѕРіРµРѕР»РѕРіРёСЏ Рё С€С‚Р°РјРїС‹', loc: 'Рі. РђР»РјР°С‚С‹', specs: 'РћРїС‹С‚РЅС‹Рµ РѕС‚РєР°С‡РєРё РІРѕРґС‹, РјРѕРґСѓР»СЊ РґРµС„РѕСЂРјР°С†РёРё РіСЂР°РІРёР№РЅС‹С… РіСЂСѓРЅС‚РѕРІ', year: '2024', coords: [43.2014, 76.8926], image: '/images/rig.png' },
  { id: 'bi-botanic', client: 'BI Group', name: 'Р–Рљ В«Botanic GardenВ»', type: 'Р“РµРѕРґРµР·РёС‡РµСЃРєРёР№ РјРѕРЅРёС‚РѕСЂРёРЅРі РѕСЃР°РґРєРѕРІ', loc: 'Рі. РђСЃС‚Р°РЅР°', specs: 'Р’С‹СЃРѕРєРѕС‚РѕС‡РЅРѕРµ РЅРёРІРµР»РёСЂРѕРІР°РЅРёРµ С„СѓРЅРґР°РјРµРЅС‚РѕРІ РЅР° СЃР»Р°Р±С‹С… РіР»РёРЅР°С…', year: '2023', coords: [51.1158, 71.4187], image: '/images/lab.png' },
  { id: 'kaz-shaft', client: 'РљР°СЂР°РіР°РЅРґР°РЈРіРѕР»СЊ', name: 'РЁР°С…С‚РЅС‹Р№ РєРѕРїРµСЂ С€Р°С…С‚С‹ РљР°Р·Р°С…СЃС‚Р°РЅСЃРєР°СЏ', type: 'РЎРµР№СЃРјРѕР°РєСѓСЃС‚РёРєР° Рё СЃРєР°Р»СЊРЅРѕРµ Р±СѓСЂРµРЅРёРµ', loc: 'РљР°СЂР°РіР°РЅРґРёРЅСЃРєР°СЏ РѕР±Р».', specs: 'Р‘СѓСЂРµРЅРёРµ 50Рј СЃРєРІР°Р¶РёРЅ РІ Р°Р»РµРІСЂРѕР»РёС‚Р°С… Рё РїРµСЃС‡Р°РЅРёРєР°С…', year: '2023', coords: [49.8019, 73.1021], image: '/images/geodesy.png' }
];

// Blog Articles Database (100+ simulated articles, 3 detailed ones)
const BLOG_POSTS = [
  {
    id: 'cpt',
    title: 'Р§С‚Рѕ С‚Р°РєРѕРµ CPT (Cone Penetration Testing)?',
    category: 'РњРµС‚РѕРґРѕР»РѕРіРёСЏ',
    date: '2026-07-01',
    readTime: '5 РјРёРЅ',
    excerpt: 'РџРѕРґСЂРѕР±РЅРѕРµ СЂСѓРєРѕРІРѕРґСЃС‚РІРѕ РїРѕ СЃС‚Р°С‚РёС‡РµСЃРєРѕРјСѓ Р·РѕРЅРґРёСЂРѕРІР°РЅРёСЋ РіСЂСѓРЅС‚РѕРІ СѓСЃС‚Р°РЅРѕРІРєР°РјРё Р“Р•РћРўР•РЎРў СЃРѕРіР»Р°СЃРЅРѕ Р“РћРЎРў 19912.',
    content: 'РЎС‚Р°С‚РёС‡РµСЃРєРѕРµ Р·РѕРЅРґРёСЂРѕРІР°РЅРёРµ (CPT) СЏРІР»СЏРµС‚СЃСЏ РѕРґРЅРёРј РёР· РєР»СЋС‡РµРІС‹С… РјРµС‚РѕРґРѕРІ РїРѕР»РµРІС‹С… РёР·С‹СЃРєР°РЅРёР№ РІ Р Рљ. Р’ РїСЂРѕС†РµСЃСЃРµ РІРґР°РІР»РёРІР°РЅРёСЏ РєРѕРЅСѓСЃР° СЃ РїРѕСЃС‚РѕСЏРЅРЅРѕР№ СЃРєРѕСЂРѕСЃС‚СЊСЋ 2 СЃРј/СЃ РёР·РјРµСЂСЏРµС‚СЃСЏ СЃРѕРїСЂРѕС‚РёРІР»РµРЅРёРµ РіСЂСѓРЅС‚Р° РїРѕРґ РЅР°РєРѕРЅРµС‡РЅРёРєРѕРј (qc) Рё С‚СЂРµРЅРёРµ РїРѕ Р±РѕРєРѕРІРѕР№ РјСѓС„С‚Рµ (fs). РњРµС‚РѕРґ РЅРµР·Р°РјРµРЅРёРј РґР»СЏ РѕРїСЂРµРґРµР»РµРЅРёСЏ РїР»РѕС‚РЅРѕСЃС‚Рё РїРµСЃС‡Р°РЅС‹С… РіСЂСѓРЅС‚РѕРІ Рё РєРѕРЅСЃРёСЃС‚РµРЅС†РёРё РіР»РёРЅРёСЃС‚С‹С…...'
  },
  {
    id: 'geology-seismic',
    title: 'РРЅР¶РµРЅРµСЂРЅР°СЏ РіРµРѕР»РѕРіРёСЏ РІ СЃРµР№СЃРјРѕРѕРїР°СЃРЅС‹С… СЂРµРіРёРѕРЅР°С… Р Рљ',
    category: 'Р РµРіР»Р°РјРµРЅС‚',
    date: '2026-06-25',
    readTime: '8 РјРёРЅ',
    excerpt: 'РћСЃРѕР±РµРЅРЅРѕСЃС‚Рё РёР·С‹СЃРєР°РЅРёР№ РїРѕРґ РІС‹СЃРѕС‚РЅРѕРµ СЃС‚СЂРѕРёС‚РµР»СЊСЃС‚РІРѕ РІ РђР»РјР°С‚РёРЅСЃРєРѕР№ Рё Р–Р°РјР±С‹Р»СЃРєРѕР№ РѕР±Р»Р°СЃС‚СЏС… (СЃРµР№СЃРјРёРєР° 9 Р±Р°Р»Р»РѕРІ).',
    content: 'РџСЂРё РїСЂРѕРµРєС‚РёСЂРѕРІР°РЅРёРё РІ СЂР°Р№РѕРЅР°С… СЃ СЃРµР№СЃРјРёС‡РЅРѕСЃС‚СЊСЋ 9 Р±Р°Р»Р»РѕРІ РЅРѕСЂРјС‹ РЎРџ Р Рљ С‚СЂРµР±СѓСЋС‚ Р±СѓСЂРµРЅРёСЏ СЃРєРІР°Р¶РёРЅ РЅР° РіР»СѓР±РёРЅСѓ РЅРµ РјРµРЅРµРµ 30-40 РјРµС‚СЂРѕРІ, РѕР±СЏР·Р°С‚РµР»СЊРЅРѕРіРѕ РїСЂРѕРІРµРґРµРЅРёСЏ РіРµРѕС„РёР·РёС‡РµСЃРєРёС… РёР·С‹СЃРєР°РЅРёР№ (СЃРµР№СЃРјРѕР°РєСѓСЃС‚РёРєР°) Рё С€С‚Р°РјРїРѕРІС‹С… РёСЃРїС‹С‚Р°РЅРёР№ РЁР’-60 РґР»СЏ РѕРїСЂРµРґРµР»РµРЅРёСЏ С‚РѕС‡РЅРѕРіРѕ РјРѕРґСѓР»СЏ РґРµС„РѕСЂРјР°С†РёРё РЅРµСЃСѓС‰РµРіРѕ РіРѕСЂРёР·РѕРЅС‚Р°...'
  },
  {
    id: 'sp-rk-updates',
    title: 'РђРєС‚СѓР°Р»СЊРЅС‹Рµ РѕР±РЅРѕРІР»РµРЅРёСЏ РЎРџ Р Рљ 1.02-104-2020',
    category: 'РЎРџ Р Рљ',
    date: '2026-06-18',
    readTime: '6 РјРёРЅ',
    excerpt: 'РћР±Р·РѕСЂ РёР·РјРµРЅРµРЅРёР№ РІ СЃРІРѕРґРµ РїСЂР°РІРёР» Р РµСЃРїСѓР±Р»РёРєРё РљР°Р·Р°С…СЃС‚Р°РЅ РїРѕ РёРЅР¶РµРЅРµСЂРЅС‹Рј РёР·С‹СЃРєР°РЅРёСЏРј РґР»СЏ СЃС‚СЂРѕРёС‚РµР»СЊСЃС‚РІР°.',
    content: 'РќРѕРІР°СЏ СЂРµРґР°РєС†РёСЏ РЎРџ Р Рљ РІРІРѕРґРёС‚ СЃС‚СЂРѕРіРёРµ С‚СЂРµР±РѕРІР°РЅРёСЏ Рє РѕР±СЏР·Р°С‚РµР»СЊРЅРѕР№ РјРµС‚СЂРѕР»РѕРіРёС‡РµСЃРєРѕР№ Р°С‚С‚РµСЃС‚Р°С†РёРё РіСЂСѓРЅС‚РѕРІС‹С… Р»Р°Р±РѕСЂР°С‚РѕСЂРёР№. Р РµР·СѓР»СЊС‚Р°С‚С‹ СЂСѓС‡РЅС‹С… РєРѕРјРїСЂРµСЃСЃРёРѕРЅРЅС‹С… РёСЃРїС‹С‚Р°РЅРёР№ Р±РµР· Р°РІС‚РѕРјР°С‚РёС‡РµСЃРєРѕР№ Р·Р°РїРёСЃРё РґРµС„РѕСЂРјР°С†РёР№ Р±РѕР»СЊС€Рµ РЅРµ РїСЂРёРЅРёРјР°СЋС‚СЃСЏ Р“РѕСЃСЌРєСЃРїРµСЂС‚РёР·РѕР№...'
  }
];

// Document database
const DOCUMENTS_DATA = [
  { id: 'lic-gsl', title: 'Р“РѕСЃСѓРґР°СЂСЃС‚РІРµРЅРЅР°СЏ Р›РёС†РµРЅР·РёСЏ РўРћРћ В«РЎРїРµС†РРЅР¶Р“РµРѕВ»', subtitle: 'Р“РЎР› в„–19004562', desc: 'Р‘РµСЃСЃСЂРѕС‡РЅР°СЏ Р»РёС†РµРЅР·РёСЏ I РєР°С‚РµРіРѕСЂРёРё РЅР° РїСЂР°РІРѕ РІС‹РїРѕР»РЅРµРЅРёСЏ РїСЂРѕРµРєС‚РЅРѕ-РёР·С‹СЃРєР°С‚РµР»СЊСЃРєРёС… СЂР°Р±РѕС‚ РЅР° РІСЃРµР№ С‚РµСЂСЂРёС‚РѕСЂРёРё Р РµСЃРїСѓР±Р»РёРєРё РљР°Р·Р°С…СЃС‚Р°РЅ.' },
  { id: 'accreditation', title: 'РђС‚С‚РµСЃС‚Р°С‚ Р°РєРєСЂРµРґРёС‚Р°С†РёРё РіСЂСѓРЅС‚РѕРІРѕР№ Р»Р°Р±РѕСЂР°С‚РѕСЂРёРё', subtitle: 'РЎРў Р Рљ РРЎРћ/РњР­Рљ 17025', desc: 'РђС‚С‚РµСЃС‚Р°С‚ СЃРѕРѕС‚РІРµС‚СЃС‚РІРёСЏ РёСЃРїС‹С‚Р°С‚РµР»СЊРЅРѕР№ РіСЂСѓРЅС‚РѕРІРѕР№ Р»Р°Р±РѕСЂР°С‚РѕСЂРёРё РєСЂРёС‚РµСЂРёСЏРј РіРѕСЃСѓРґР°СЂСЃС‚РІРµРЅРЅРѕР№ СЃРёСЃС‚РµРјС‹ Р°РєРєСЂРµРґРёС‚Р°С†РёРё Р Рљ.' },
  { id: 'iso-9001', title: 'РЎРµСЂС‚РёС„РёРєР°С‚ ISO 9001:2015', subtitle: 'РЎРёСЃС‚РµРјР° РјРµРЅРµРґР¶РјРµРЅС‚Р° РєР°С‡РµСЃС‚РІР°', desc: 'РЎРµСЂС‚РёС„РёРєР°С‚ СЃРѕРѕС‚РІРµС‚СЃС‚РІРёСЏ С‚СЂРµР±РѕРІР°РЅРёСЏРј РїСЂРѕРІРµРґРµРЅРёСЏ РёРЅР¶РµРЅРµСЂРЅРѕ-РіРµРѕР»РѕРіРёС‡РµСЃРєРёС… Рё РіРµРѕРґРµР·РёС‡РµСЃРєРёС… РёР·С‹СЃРєР°РЅРёР№.' },
  { id: 'iso-14001', title: 'РЎРµСЂС‚РёС„РёРєР°С‚ ISO 14001:2015', subtitle: 'Р­РєРѕР»РѕРіРёС‡РµСЃРєРёР№ РјРµРЅРµРґР¶РјРµРЅС‚', desc: 'РџРѕРґС‚РІРµСЂР¶РґРµРЅРёРµ СЃРѕРѕС‚РІРµС‚СЃС‚РІРёСЏ СЌРєРѕР»РѕРіРёС‡РµСЃРєРёРј С‚СЂРµР±РѕРІР°РЅРёСЏРј РїСЂРё РїСЂРѕРІРµРґРµРЅРёРё Р±СѓСЂРѕРІС‹С… РїРѕР»РµРІС‹С… СЂР°Р±РѕС‚.' },
  { id: 'iso-45001', title: 'РЎРµСЂС‚РёС„РёРєР°С‚ ISO 45001:2018', subtitle: 'РћС…СЂР°РЅР° Р·РґРѕСЂРѕРІСЊСЏ Рё Р±РµР·РѕРїР°СЃРЅРѕСЃС‚СЊ', desc: 'РЎРµСЂС‚РёС„РёРєР°С†РёСЏ СЃРёСЃС‚РµРј РјРµРЅРµРґР¶РјРµРЅС‚Р° Р±РµР·РѕРїР°СЃРЅРѕСЃС‚Рё С‚СЂСѓРґР° РїСЂРё СЌРєСЃРїР»СѓР°С‚Р°С†РёРё Р±СѓСЂРѕРІРѕРіРѕ РѕР±РѕСЂСѓРґРѕРІР°РЅРёСЏ.' }
];

// HUD Bracket layout card wrapper
function HudCard({ children, className = '', style = {}, onClick }) {
  return (
    <div className={`tech-card ${className}`} style={style} onClick={onClick}>
      <div className="hud-bracket hud-bracket-tl"></div>
      <div className="hud-bracket hud-bracket-tr"></div>
      <div className="hud-bracket hud-bracket-bl"></div>
      <div className="hud-bracket hud-bracket-br"></div>
      {children}
    </div>
  );
}

function EditableText({ id, defaultText, isVisualBuilder, dangerously = false, as: Component = 'span', className, style, ...props }) {
  const adminVal = typeof window !== 'undefined' && window.__adminVisualTexts?.[id];
  const [text, setText] = useState(() => adminVal || localStorage.getItem(`vb_${id}`) || defaultText);

  useEffect(() => {
    if (adminVal && adminVal !== text) {
      setText(adminVal);
    } else if (defaultText && !adminVal && !localStorage.getItem(`vb_${id}`)) {
      setText(defaultText);
    }
  }, [adminVal, defaultText]);

  useEffect(() => {
    const handleUpdate = (e) => {
      if (e.detail.id === id) {
        setText(e.detail.text);
        localStorage.setItem(`vb_${id}`, e.detail.text);
        if (window.__setAdminVisualText) {
          window.__setAdminVisualText(id, e.detail.text);
        }
      }
    };
    window.addEventListener('vb_update', handleUpdate);
    return () => window.removeEventListener('vb_update', handleUpdate);
  }, [id]);

  useEffect(() => {
    if (text !== defaultText && text !== localStorage.getItem(`vb_${id}`)) {
      localStorage.setItem(`vb_${id}`, text);
      if (window.__setAdminVisualText) {
        window.__setAdminVisualText(id, text);
      }
    }
  }, [text, id, defaultText]);

  return (
    <Component
      style={{
        ...style,
        outline: isVisualBuilder ? '2px dashed var(--color-accent)' : 'none',
        outlineOffset: '2px',
        cursor: isVisualBuilder ? 'text' : 'inherit',
        display: isVisualBuilder ? 'inline-block' : (style && style.display ? style.display : undefined),
        minWidth: isVisualBuilder ? '20px' : 'auto',
        minHeight: isVisualBuilder ? '1em' : 'auto',
        transition: 'outline 0.3s ease',
        borderRadius: '4px',
        padding: isVisualBuilder ? '2px 4px' : '0'
      }}
      className={className}
      contentEditable={isVisualBuilder}
      suppressContentEditableWarning={true}
      onClick={(e) => {
        if (isVisualBuilder) {
          e.stopPropagation();
          e.preventDefault();
          window.dispatchEvent(new CustomEvent('vb_select', { detail: { id, text } }));
        }
      }}
      onBlur={(e) => {
        const val = dangerously ? e.currentTarget.innerHTML : e.currentTarget.textContent;
        setText(val);
        localStorage.setItem(`vb_${id}`, val);
        if (window.__setAdminVisualText) {
          window.__setAdminVisualText(id, val);
        }
        if (isVisualBuilder) {
          window.dispatchEvent(new CustomEvent('vb_select', { detail: { id, text: val } }));
        }
      }}
      dangerouslySetInnerHTML={dangerously ? { __html: text } : undefined}
      {...props}
    >
      {!dangerously ? text : null}
    </Component>
  );
}

const HERO_ICONS = [Layers, Compass, Cpu, ShieldCheck];

const MENU_STRUCTURE = {
  ru: [
    { title: 'Р“Р»Р°РІРЅР°СЏ', page: 'home', action: { type: 'page', val: 'home' } },
    { 
      title: 'Рћ РєРѕРјРїР°РЅРёРё', page: 'about', 
      items: [
        { name: 'РСЃС‚РѕСЂРёСЏ', action: { type: 'page', val: 'about', subpage: 'history' } },
        { name: 'РљРѕРјР°РЅРґР°', action: { type: 'page', val: 'about', subpage: 'team' } },
        { name: 'РќР°С€Рё РїСЂРµРёРјСѓС‰РµСЃС‚РІР°', action: { type: 'page', val: 'about', subpage: 'advantages' } },
        { name: 'Р›РёС†РµРЅР·РёРё Рё СЃРµСЂС‚РёС„РёРєР°С‚С‹', action: { type: 'page', val: 'about', subpage: 'documents' } }
      ]
    },
    {
      title: 'РЈСЃР»СѓРіРё', page: 'services',
      columns: 2,
      items: [
        { name: 'РРЅР¶РµРЅРµСЂРЅРѕ-РіРµРѕР»РѕРіРёС‡РµСЃРєРёРµ РёР·С‹СЃРєР°РЅРёСЏ', action: { type: 'service', val: 'geology' } },
        { name: 'РРЅР¶РµРЅРµСЂРЅРѕ-РіРµРѕРґРµР·РёС‡РµСЃРєРёРµ РёР·С‹СЃРєР°РЅРёСЏ', action: { type: 'service', val: 'geodesy' } },
        { name: 'Р­РєРѕР»РѕРіРёС‡РµСЃРєРёРµ РёР·С‹СЃРєР°РЅРёСЏ', action: { type: 'service', val: 'geology' } },
        { name: 'Р“РёРґСЂРѕРјРµС‚РµРѕСЂРѕР»РѕРіРёС‡РµСЃРєРёРµ РёР·С‹СЃРєР°РЅРёСЏ', action: { type: 'service', val: 'geodesy' } },
        { name: 'Р‘СѓСЂРµРЅРёРµ РёРЅР¶РµРЅРµСЂРЅРѕ-РіРµРѕР»РѕРіРёС‡РµСЃРєРёС… СЃРєРІР°Р¶РёРЅ', action: { type: 'service', val: 'geology' } },
        { name: 'Р“РёРґСЂРѕРіРµРѕР»РѕРіРёС‡РµСЃРєРёРµ РёСЃСЃР»РµРґРѕРІР°РЅРёСЏ', action: { type: 'service', val: 'hydrogeology' } },
        { name: 'РЎС‚Р°С‚РёС‡РµСЃРєРѕРµ Р·РѕРЅРґРёСЂРѕРІР°РЅРёРµ (CPT)', action: { type: 'service', val: 'cpt' } },
        { name: 'РЎС‚Р°С‚РёС‡РµСЃРєРёРµ РёСЃРїС‹С‚Р°РЅРёСЏ СЃРІР°Р№', action: { type: 'service', val: 'piles' } },
        { name: 'Р”РёРЅР°РјРёС‡РµСЃРєРёРµ РёСЃРїС‹С‚Р°РЅРёСЏ СЃРІР°Р№', action: { type: 'service', val: 'piles' } },
        { name: 'РЁС‚Р°РјРїРѕРІС‹Рµ РёСЃРїС‹С‚Р°РЅРёСЏ', action: { type: 'service', val: 'plates' } },
        { name: 'Р›Р°Р±РѕСЂР°С‚РѕСЂРЅС‹Рµ РёСЃСЃР»РµРґРѕРІР°РЅРёСЏ', action: { type: 'service', val: 'laboratory' } },
        { name: 'Р’РѕРґРѕРїРѕРЅРёР¶РµРЅРёРµ', action: { type: 'service', val: 'hydrogeology' } },
        { name: 'РџСЂРѕРµРєС‚РёСЂРѕРІР°РЅРёРµ РІРѕРґРѕРїРѕРЅРёР¶РµРЅРёСЏ', action: { type: 'service', val: 'hydrogeology' } }
      ]
    },
    {
      title: 'РџСЂРѕРµРєС‚С‹', page: 'projects',
      items: [
        { name: 'РџРѕРёСЃРє', action: { type: 'page', val: 'projects', subpage: 'search' } },
        { name: 'РџРѕ СЂРµРіРёРѕРЅР°Рј', action: { type: 'page', val: 'projects', subpage: 'regions' } },
        { name: 'РџРѕ СѓСЃР»СѓРіР°Рј', action: { type: 'page', val: 'projects', subpage: 'services' } },
        { name: 'РџРѕ Р·Р°РєР°Р·С‡РёРєР°Рј', action: { type: 'page', val: 'projects', subpage: 'clients' } },
        { name: 'РЎС‚СЂР°РЅРёС†Р° РїСЂРѕРµРєС‚Р°', action: { type: 'page', val: 'projects', subpage: 'detail' } }
      ]
    },
    {
      title: 'РћР±РѕСЂСѓРґРѕРІР°РЅРёРµ', page: 'equipment',
      items: [
        { name: 'Р‘СѓСЂРѕРІС‹Рµ СѓСЃС‚Р°РЅРѕРІРєРё', action: { type: 'equip', cat: 'rigs', idx: 0 } },
        { name: 'CPT', action: { type: 'equip', cat: 'lab', idx: 0 } },
        { name: 'Р“РµРѕРґРµР·РёС‡РµСЃРєРѕРµ РѕР±РѕСЂСѓРґРѕРІР°РЅРёРµ', action: { type: 'equip', cat: 'lab', idx: 2 } },
        { name: 'РСЃРїС‹С‚Р°С‚РµР»СЊРЅРѕРµ РѕР±РѕСЂСѓРґРѕРІР°РЅРёРµ', action: { type: 'equip', cat: 'lab', idx: 1 } },
        { name: 'Р›Р°Р±РѕСЂР°С‚РѕСЂРёСЏ', action: { type: 'equip', cat: 'lab', idx: 2 } },
        { name: 'РќР°СЃРѕСЃРЅРѕРµ РѕР±РѕСЂСѓРґРѕРІР°РЅРёРµ', action: { type: 'equip', cat: 'lab', idx: 2 } },
        { name: 'РђРІС‚РѕС‚СЂР°РЅСЃРїРѕСЂС‚', action: { type: 'equip', cat: 'rigs', idx: 1 } }
      ]
    },
    {
      title: 'Р‘Р°Р·Р° Р·РЅР°РЅРёР№', page: 'blog',
      items: [
        { name: 'РЎС‚Р°С‚СЊРё', action: { type: 'page', val: 'blog', subpage: 'articles' } },
        { name: 'РњРµС‚РѕРґС‹ РёСЃРїС‹С‚Р°РЅРёР№', action: { type: 'page', val: 'blog', subpage: 'methods' } },
        { name: 'РўРёРїС‹ РіСЂСѓРЅС‚РѕРІ', action: { type: 'page', val: 'blog', subpage: 'soils' } },
        { name: 'РќРѕСЂРјР°С‚РёРІРЅС‹Рµ РґРѕРєСѓРјРµРЅС‚С‹', action: { type: 'page', val: 'blog', subpage: 'norms' } },
        { name: 'FAQ', action: { type: 'page', val: 'blog', subpage: 'faq' } },
        { name: 'РќРѕРІРѕСЃС‚Рё', action: { type: 'page', val: 'blog', subpage: 'news' } },
        { name: 'Р¤РѕС‚Рѕ', action: { type: 'page', val: 'blog', subpage: 'photos' } },
        { name: 'Р’РёРґРµРѕ', action: { type: 'page', val: 'blog', subpage: 'videos' } }
      ]
    },
    { title: 'РљРѕРЅС‚Р°РєС‚С‹', page: 'contacts', action: { type: 'page', val: 'contacts' } }
  ]
};


function ImageUploadField({ value, onChange, theme }) {
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.type && file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (ev) => {
          const img = new window.Image();
          img.onload = () => {
            const canvas = document.createElement('canvas');
            let width = img.width;
            let height = img.height;
            const maxDim = 1200;
            if (width > maxDim || height > maxDim) {
              if (width > height) {
                height = Math.round((height * maxDim) / width);
                width = maxDim;
              } else {
                width = Math.round((width * maxDim) / height);
                height = maxDim;
              }
            }
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, width, height);
            const compressed = canvas.toDataURL('image/jpeg', 0.82);
            
            fetch(compressed).then(res => res.blob()).then(blob => {
              uploadFileToServer(new File([blob], file.name, { type: 'image/jpeg' })).then(url => {
                if (url) onChange(url);
              });
            });
          };
          img.src = ev.target.result;
        };
        reader.readAsDataURL(file);
      } else {
        uploadFileToServer(file).then(url => {
          if (url) onChange(url);
        });
      }
    }
  };
  
  const isLight = theme === 'white';

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: isLight ? '#fff' : '#000', padding: '6px', border: isLight ? '1px solid #cbd5e1' : '1px solid #444', borderRadius: '8px', flex: 1, boxShadow: isLight ? 'inset 0 1px 2px rgba(0,0,0,0.05)' : 'none' }}>
      {value && <img src={value} style={{ width: '32px', height: '32px', objectFit: 'cover', borderRadius: '4px', border: isLight ? '1px solid #e2e8f0' : '1px solid #222' }} alt="" onError={(e) => { e.target.style.display = 'none'; }} onLoad={(e) => { e.target.style.display = 'block'; }} />}
      <label style={{ background: isLight ? '#eff6ff' : 'rgba(59, 130, 246, 0.2)', color: '#3b82f6', border: isLight ? '1px solid #bfdbfe' : '1px solid rgba(59, 130, 246, 0.5)', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '6px', whiteSpace: 'nowrap', transition: 'all 0.2s' }}>
        <Folder size={14} /> Р’С‹Р±СЂР°С‚СЊ
        <input type="file" accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt,.csv,.zip,.rar" onChange={handleFileChange} style={{ display: 'none' }} />
      </label>
      <input 
        value={value || ''} 
        onChange={e => onChange(e.target.value)} 
        placeholder="РР»Рё РІСЃС‚Р°РІСЊС‚Рµ URL СЃСЃС‹Р»РєРё..." 
        style={{ width: '100px', flex: 1, background: 'transparent', border: 'none', color: isLight ? '#0f172a' : '#fff', outline: 'none', padding: '0 5px', fontSize: '0.85rem' }} 
      />
    </div>
  );
}

function App() {

  

const DEFAULT_HISTORY = [
  { title: '2019', desc: 'РћСЃРЅРѕРІР°РЅРёРµ РєРѕРјРїР°РЅРёРё РўРћРћ В«РЎРїРµС†РРЅР¶Р“РµРѕВ». РќР°С‡Р°Р»Рѕ СЂР°Р±РѕС‚С‹ РІ Рі. РђР»РјР°С‚С‹.' },
  { title: '2021', desc: 'Р Р°СЃС€РёСЂРµРЅРёРµ РїР°СЂРєР° Р±СѓСЂРѕРІС‹С… РјР°С€РёРЅ. Р’С‹С…РѕРґ РЅР° РѕР±СЉРµРєС‚С‹ РіРѕСЃСѓРґР°СЂСЃС‚РІРµРЅРЅРѕРіРѕ Р·РЅР°С‡РµРЅРёСЏ.' },
  { title: '2023', desc: 'Р’РЅРµРґСЂРµРЅРёРµ CPT С‚РµС…РЅРѕР»РѕРіРёР№. РћС‚РєСЂС‹С‚РёРµ СЃРѕР±СЃС‚РІРµРЅРЅРѕР№ РіСЂСѓРЅС‚РѕРІРѕР№ Р»Р°Р±РѕСЂР°С‚РѕСЂРёРё.' },
  { title: '2025', desc: 'Р¦РёС„СЂРѕРІРёР·Р°С†РёСЏ Р±РёР·РЅРµСЃ-РїСЂРѕС†РµСЃСЃРѕРІ. РњРѕРґРµСЂРЅРёР·Р°С†РёСЏ РРў-РёРЅС„СЂР°СЃС‚СЂСѓРєС‚СѓСЂС‹.' }
];

const DEFAULT_ADVANTAGES = [
  { title: 'Р›РёС†РµРЅР·РёСЏ II РєР°С‚РµРіРѕСЂРёРё', desc: 'РРјРµРµРј РіРѕСЃСѓРґР°СЂСЃС‚РІРµРЅРЅСѓСЋ Р»РёС†РµРЅР·РёСЋ РЅР° СЃС‚СЂРѕРёС‚РµР»СЊРЅРѕ-РјРѕРЅС‚Р°Р¶РЅС‹Рµ Рё РёР·С‹СЃРєР°С‚РµР»СЊСЃРєРёРµ СЂР°Р±РѕС‚С‹.', image: 'Award' },
  { title: 'РЎРѕР±СЃС‚РІРµРЅРЅС‹Р№ Р°РІС‚РѕРїР°СЂРє', desc: 'Р‘РѕР»РµРµ 15 РµРґРёРЅРёС† СЃРїРµС†С‚РµС…РЅРёРєРё, РІРєР»СЋС‡Р°СЏ Р±СѓСЂРѕРІС‹Рµ СѓСЃС‚Р°РЅРѕРІРєРё Рё Р»Р°Р±РѕСЂР°С‚РѕСЂРёРё.', image: 'Truck' },
  { title: 'РЁС‚Р°С‚ СЌРєСЃРїРµСЂС‚РѕРІ', desc: 'РђС‚С‚РµСЃС‚РѕРІР°РЅРЅС‹Рµ РіРµРѕР»РѕРіРё, РіРµРѕРґРµР·РёСЃС‚С‹ Рё РёРЅР¶РµРЅРµСЂС‹ СЃ РѕРїС‹С‚РѕРј Р±РѕР»РµРµ 10 Р»РµС‚.', image: 'Users' }
];

const DEFAULT_TEAM = [
  { name: 'Р§СѓРґРёРЅРѕРІ РљРѕРЅСЃС‚Р°РЅС‚РёРЅ РћР»РµРіРѕРІРёС‡', position: 'Р“РµРЅРµСЂР°Р»СЊРЅС‹Р№ РґРёСЂРµРєС‚РѕСЂ', desc: 'РћСЃРЅРѕРІР°С‚РµР»СЊ РєРѕРјРїР°РЅРёРё, РїСЂРѕС„РµСЃСЃРёРѕРЅР°Р»СЊРЅС‹Р№ РіРµРѕР»РѕРі СЃ 15-Р»РµС‚РЅРёРј СЃС‚Р°Р¶РµРј. Р СѓРєРѕРІРѕРґРёС‚ СЃС‚СЂР°С‚РµРіРёС‡РµСЃРєРёРј СЂР°Р·РІРёС‚РёРµРј Рё РєР»СЋС‡РµРІС‹РјРё РїСЂРѕРµРєС‚Р°РјРё.', image: '/images/director.png' }
];

const DEFAULT_FAQ = [
  { question: 'РљР°РєРёРµ СЃСЂРѕРєРё РІС‹РїРѕР»РЅРµРЅРёСЏ РёР·С‹СЃРєР°РЅРёР№?', answer: 'Р’ СЃСЂРµРґРЅРµРј РїРѕР»РµРІС‹Рµ СЂР°Р±РѕС‚С‹ Р·Р°РЅРёРјР°СЋС‚ РѕС‚ 3 РґРѕ 7 РґРЅРµР№, Р»Р°Р±РѕСЂР°С‚РѕСЂРЅС‹Рµ РёСЃСЃР»РµРґРѕРІР°РЅРёСЏ вЂ” РґРѕ 14 РґРЅРµР№.' },
  { question: 'Р Р°Р±РѕС‚Р°РµС‚Рµ Р»Рё РІС‹ РІ СЂРµРіРёРѕРЅР°С…?', answer: 'Р”Р°, РјС‹ РјРѕР±РёР»РёР·СѓРµРј С‚РµС…РЅРёРєСѓ РІ Р»СЋР±СѓСЋ С‚РѕС‡РєСѓ РљР°Р·Р°С…СЃС‚Р°РЅР° РІ С‚РµС‡РµРЅРёРµ 48 С‡Р°СЃРѕРІ.' }
];

const DEFAULT_METHODS = [
  { title: 'РЎС‚Р°С‚РёС‡РµСЃРєРѕРµ Р·РѕРЅРґРёСЂРѕРІР°РЅРёРµ (CPT)', desc: 'РќРµРїСЂРµСЂС‹РІРЅРѕРµ РІРґР°РІР»РёРІР°РЅРёРµ РєРѕРЅСѓСЃР° РґР»СЏ РѕРїСЂРµРґРµР»РµРЅРёСЏ РЅРµСЃСѓС‰РµР№ СЃРїРѕСЃРѕР±РЅРѕСЃС‚Рё РіСЂСѓРЅС‚Р°.' },
  { title: 'РЁС‚Р°РјРїРѕРІС‹Рµ РёСЃРїС‹С‚Р°РЅРёСЏ', desc: 'РћРїСЂРµРґРµР»РµРЅРёРµ РјРѕРґСѓР»СЏ РґРµС„РѕСЂРјР°С†РёРё СЃ РїРѕРјРѕС‰СЊСЋ РІРёРЅС‚РѕРІРѕРіРѕ С€С‚Р°РјРїР° РЁР’-60.' }
];

const DEFAULT_SOILS = [
  { title: 'РЎСѓРіР»РёРЅРєРё Рё РіР»РёРЅС‹', desc: 'РЎРІСЏР·РЅС‹Рµ РіСЂСѓРЅС‚С‹, С‚СЂРµР±СѓСЋС‰РёРµ С‚С‰Р°С‚РµР»СЊРЅРѕРіРѕ Р»Р°Р±РѕСЂР°С‚РѕСЂРЅРѕРіРѕ Р°РЅР°Р»РёР·Р° РЅР° РІР»Р°Р¶РЅРѕСЃС‚СЊ Рё РїР»Р°СЃС‚РёС‡РЅРѕСЃС‚СЊ.' },
  { title: 'РџРµСЃРєРё Рё СЃСѓРїРµСЃРё', desc: 'РќРµСЃРІСЏР·РЅС‹Рµ РіСЂСѓРЅС‚С‹, С‡Р°СЃС‚Рѕ СЏРІР»СЏСЋС‰РёРµСЃСЏ РЅР°РґРµР¶РЅС‹Рј РѕСЃРЅРѕРІР°РЅРёРµРј РґР»СЏ С„СѓРЅРґР°РјРµРЅС‚РѕРІ.' }
];

const DEFAULT_NORMS = [
  { title: 'РЎРџ Р Рљ 1.02-104-2020', desc: 'РРЅР¶РµРЅРµСЂРЅС‹Рµ РёР·С‹СЃРєР°РЅРёСЏ РґР»СЏ СЃС‚СЂРѕРёС‚РµР»СЊСЃС‚РІР°. РћСЃРЅРѕРІРЅС‹Рµ РїРѕР»РѕР¶РµРЅРёСЏ.' },
  { title: 'Р“РћРЎРў 19912-2012', desc: 'Р“СЂСѓРЅС‚С‹. РњРµС‚РѕРґС‹ РїРѕР»РµРІС‹С… РёСЃРїС‹С‚Р°РЅРёР№ СЃС‚Р°С‚РёС‡РµСЃРєРёРј Рё РґРёРЅР°РјРёС‡РµСЃРєРёРј Р·РѕРЅРґРёСЂРѕРІР°РЅРёРµРј.' }
];

// === ADMIN DATA FOR BLOCKS ===

  const [adminData, setAdminData] = useState(() => {
    const saved = localStorage.getItem('spengeo_admin_data');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (!Array.isArray(parsed.team)) {
        parsed.team = parsed.team ? [parsed.team] : [];
      }
      if (!parsed.media) {
        parsed.media = { rigBg: "/images/rig.jpg", labBg: "/images/lab.jpg", geoBg: "/images/geo.jpg" };
      }
      if (!parsed.bot) {
        parsed.bot = { name: 'SPENGEO_ASSISTANT', welcomeMsg: 'Р—РґСЂР°РІСЃС‚РІСѓР№С‚Рµ! РЇ Р°РІС‚РѕРјР°С‚РёС‡РµСЃРєРёР№ Р°СЃСЃРёСЃС‚РµРЅС‚ РЎРїРµС†РРЅР¶Р“РµРѕ. Р§РµРј РјРѕРіСѓ РїРѕРјРѕС‡СЊ?', active: true, scenarios: [{ id: Date.now().toString(), keywords: 'С†РµРЅР°, СЃС‚РѕРёРјРѕСЃС‚СЊ, РїСЂР°Р№СЃ', answer: 'Р”Р»СЏ СѓС‚РѕС‡РЅРµРЅРёСЏ СЃС‚РѕРёРјРѕСЃС‚Рё РёРЅР¶РµРЅРµСЂРЅС‹С… РёР·С‹СЃРєР°РЅРёР№ РѕСЃС‚Р°РІСЊС‚Рµ Р·Р°СЏРІРєСѓ, РЅР°С€ СЃРїРµС†РёР°Р»РёСЃС‚ СЃРІСЏР¶РµС‚СЃСЏ СЃ РІР°РјРё.' }] };
      }
      if (!parsed.articles) {
        parsed.articles = BLOG_POSTS;
      }
      if (!parsed.dynamicLists) {
        parsed.dynamicLists = {};
      }
      if (!parsed.dynamicLists['about_documents'] || parsed.dynamicLists['about_documents'].length === 0) {
        parsed.dynamicLists['about_documents'] = DOCUMENTS_DATA;
      }
      
      // Migrate hardcoded DB arrays to dynamic lists
      if (!parsed.dynamicLists['equipment_rigs_0'] || parsed.dynamicLists['equipment_rigs_0'].length === 0) {
        parsed.dynamicLists['equipment_rigs_0'] = DRILLING_RIGS;
      }
      if (!parsed.dynamicLists['equipment_lab_2'] || parsed.dynamicLists['equipment_lab_2'].length === 0) {
        parsed.dynamicLists['equipment_lab_2'] = LAB_EQUIP;
      }
      if (!parsed.dynamicLists['blog_articles'] || parsed.dynamicLists['blog_articles'].length === 0) {
        parsed.dynamicLists['blog_articles'] = BLOG_POSTS;
      }
      

      if (!parsed.dynamicLists['about_history'] || parsed.dynamicLists['about_history'].length === 0) parsed.dynamicLists['about_history'] = DEFAULT_HISTORY;
      if (!parsed.dynamicLists['about_advantages'] || parsed.dynamicLists['about_advantages'].length === 0) parsed.dynamicLists['about_advantages'] = DEFAULT_ADVANTAGES;
      
      if (!parsed.projects || parsed.projects.length === 0) {
        parsed.projects = DETAILED_PROJECTS;
      }
      if (!parsed.team || parsed.team.length === 0) {
        parsed.team = [{ name: 'РЁРµРЅРІРёР·РѕРІ Р СѓРґРѕР»СЊС„', role: 'РљРѕРЅСЃС‚Р°РЅС‚РёРЅРѕРІРёС‡', badge: 'РћРЎРќРћР’РђРўР•Р›Р¬ Р Р“Р›РђР’РќР«Р™ Р“Р•РћР›РћР“', desc: 'РњС‹ СЃС‚СЂРѕРёРј РЅР°С€Сѓ СЂР°Р±РѕС‚Сѓ РЅР° Р±РµР·СѓРїСЂРµС‡РЅРѕР№ С‚РѕС‡РЅРѕСЃС‚Рё...', img: '/images/director.png' }];
      }

      if (!parsed.dynamicLists['blog_faq'] || parsed.dynamicLists['blog_faq'].length === 0) parsed.dynamicLists['blog_faq'] = DEFAULT_FAQ;
      if (!parsed.dynamicLists['blog_methods'] || parsed.dynamicLists['blog_methods'].length === 0) parsed.dynamicLists['blog_methods'] = DEFAULT_METHODS;
      if (!parsed.dynamicLists['blog_soils'] || parsed.dynamicLists['blog_soils'].length === 0) parsed.dynamicLists['blog_soils'] = DEFAULT_SOILS;
      if (!parsed.dynamicLists['blog_norms'] || parsed.dynamicLists['blog_norms'].length === 0) parsed.dynamicLists['blog_norms'] = DEFAULT_NORMS;
      
      if (!parsed.seo) {
        parsed.seo = { yandexMetricaId: '', googleAnalyticsId: '' };
      }
      if (!parsed.global) {
        parsed.global = {
          companyName: 'РўРћРћ В«РЎРїРµС†РРЅР¶Р“РµРѕВ»',
          phone: '+7 705 969 0101',
          email: 'info@spengeo.kz',
          address: 'Р РµСЃРїСѓР±Р»РёРєР° РљР°Р·Р°С…СЃС‚Р°РЅ, Рі. РђР»РјР°С‚С‹',
          mapCoords: '43.2389, 76.8897'
        };
      }
      if (!parsed.calc) {
        parsed.calc = {
          waterCoeff: 1.15,
          seismicCoeff9: 1.1,
          seismicCoeff6: 1.0,
          holeAreaDivisor: 120,
          drillSpeedPerDay: 22,
          soilSandPrice: 18500,
          soilClayPrice: 22200,
          soilLoamPrice: 20350,
          soilRockPrice: 46250,
          soilPeatPrice: 27750
        };
      }

      return parsed;
    }
    return {
      projects: DETAILED_PROJECTS,
      rigs: DRILLING_RIGS,
      lab: LAB_EQUIP,
      services: Object.entries(SERVICES_DATA).map(([k, v]) => ({ id: k, ...v, image: `/images/services/${k}.jpg` })),
      team: [{ name: 'РЁРµРЅРІРёР·РѕРІ Р СѓРґРѕР»СЊС„', role: 'РљРѕРЅСЃС‚Р°РЅС‚РёРЅРѕРІРёС‡', badge: 'РћРЎРќРћР’РђРўР•Р›Р¬ Р Р“Р›РђР’РќР«Р™ Р“Р•РћР›РћР“', desc: 'РњС‹ СЃС‚СЂРѕРёРј РЅР°С€Сѓ СЂР°Р±РѕС‚Сѓ РЅР° Р±РµР·СѓРїСЂРµС‡РЅРѕР№ С‚РѕС‡РЅРѕСЃС‚Рё...', img: '/images/director.png' }],
      articles: BLOG_POSTS,
      dynamicLists: { 'about_documents': DOCUMENTS_DATA },
      media: { rigBg: "/images/rig.jpg", labBg: "/images/lab.jpg", geoBg: "/images/geo.jpg" },
      bot: { 
        name: 'SPENGEO_ASSISTANT', 
        welcomeMsg: 'Р—РґСЂР°РІСЃС‚РІСѓР№С‚Рµ! РЇ Р°РІС‚РѕРјР°С‚РёС‡РµСЃРєРёР№ Р°СЃСЃРёСЃС‚РµРЅС‚ РЎРїРµС†РРЅР¶Р“РµРѕ. Р§РµРј РјРѕРіСѓ РїРѕРјРѕС‡СЊ?', 
        active: true, 
        scenarios: [
          { id: Date.now().toString(), keywords: 'С†РµРЅР°, СЃС‚РѕРёРјРѕСЃС‚СЊ, РїСЂР°Р№СЃ', answer: 'Р”Р»СЏ СѓС‚РѕС‡РЅРµРЅРёСЏ СЃС‚РѕРёРјРѕСЃС‚Рё РёРЅР¶РµРЅРµСЂРЅС‹С… РёР·С‹СЃРєР°РЅРёР№ РѕСЃС‚Р°РІСЊС‚Рµ Р·Р°СЏРІРєСѓ, РЅР°С€ СЃРїРµС†РёР°Р»РёСЃС‚ СЃРІСЏР¶РµС‚СЃСЏ СЃ РІР°РјРё.' }
        ] 
      },
      calc: {
        waterCoeff: 1.15,
        seismicCoeff9: 1.1,
        seismicCoeff6: 1.0,
        holeAreaDivisor: 120,
        drillSpeedPerDay: 22,
        soilSandPrice: 18500,
        soilClayPrice: 22200,
        soilLoamPrice: 20350,
        soilRockPrice: 46250,
        soilPeatPrice: 27750
      }
    };
  });
  
  if (typeof window !== 'undefined') {
    window.__adminVisualTexts = adminData.visualTexts || {};
    window.__setAdminVisualText = (id, val) => {
      setAdminData(prev => ({
        ...prev,
        visualTexts: { ...(prev.visualTexts || {}), [id]: val }
      }));
    };
  }

  const getApiUrl = (path) => {
    if (typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
      return path;
    }
    return `http://localhost:8083${path}`;
  };

  const uploadFileToServer = async (file) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch(getApiUrl('/api/upload'), {
        method: 'POST',
        body: formData
      });
      if (res.ok) {
        const data = await res.json();
        return data.url;
      }
      return null;
    } catch (e) {
      console.error('File upload failed:', e);
      return null;
    }
  };

  const [isSavingAdmin, setIsSavingAdmin] = useState(false);
  const [adminSaveStatus, setAdminSaveStatus] = useState(null);
  const isServerSyncRef = useRef(false);

  const syncAdminDataFromServer = async (showNotification = false) => {
    try {
      const res = await fetch(getApiUrl('/api/admin/data'));
      if (res.ok) {
        const serverData = await res.json();
        if (serverData && typeof serverData === 'object' && Object.keys(serverData).length > 0) {
          isServerSyncRef.current = true;
          setAdminData(serverData);
          localStorage.setItem('spengeo_admin_data', JSON.stringify(serverData));
          
          if (serverData.visualTexts) {
            Object.entries(serverData.visualTexts).forEach(([k, v]) => {
              if (v !== undefined && v !== null) {
                localStorage.setItem(`vb_${k}`, v);
                window.dispatchEvent(new CustomEvent('vb_update', { detail: { id: k, text: v } }));
              }
            });
          }
          if (showNotification) {
            alert('вњ… Р”Р°РЅРЅС‹Рµ СѓСЃРїРµС€РЅРѕ Р·Р°РіСЂСѓР¶РµРЅС‹ Рё СЃРёРЅС…СЂРѕРЅРёР·РёСЂРѕРІР°РЅС‹ СЃ СЃРµСЂРІРµСЂРѕРј!');
          }
          return true;
        }
      }
    } catch (err) {
      console.warn('Sync failed:', err);
    }
    return false;
  };

  // Sync admin data from backend server on application mount and set up SSE for real-time updates
  useEffect(() => {
    syncAdminDataFromServer();
    
    let evtSource = null;
    let reconnectTimeout = null;
    
    const connectSSE = () => {
      evtSource = new EventSource(getApiUrl('/api/admin/data/events'));
      
      evtSource.onmessage = (event) => {
        try {
          const serverData = JSON.parse(event.data);
          if (serverData && typeof serverData === 'object' && Object.keys(serverData).length > 0) {
            isServerSyncRef.current = true;
            setAdminData(serverData);
            localStorage.setItem('spengeo_admin_data', event.data);
            
            if (serverData.visualTexts) {
              Object.entries(serverData.visualTexts).forEach(([k, v]) => {
                if (v !== undefined && v !== null) {
                  localStorage.setItem(`vb_${k}`, v);
                  window.dispatchEvent(new CustomEvent('vb_update', { detail: { id: k, text: v } }));
                }
              });
            }
          }
        } catch (e) {
          console.warn('Failed to parse SSE data:', e);
        }
      };

      evtSource.onerror = (err) => {
        evtSource.close();
        reconnectTimeout = setTimeout(connectSSE, 5000);
      };
    };

    connectSSE();

    return () => {
      if (evtSource) evtSource.close();
      if (reconnectTimeout) clearTimeout(reconnectTimeout);
    };
  }, []);

  const saveAdminData = async (customData, silent = false) => {
    const visualTexts = { ...(adminData.visualTexts || {}) };
    if (typeof localStorage !== 'undefined') {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('vb_')) {
          const vk = key.replace('vb_', '');
          visualTexts[vk] = localStorage.getItem(key);
        }
      }
    }
    const dataToSave = customData || { ...adminData, visualTexts };

    // Synchronize Global Settings (address, phone, email) to Visual Texts
    if (dataToSave.global) {
      if (dataToSave.global.address) {
        dataToSave.visualTexts['contacts_address_val'] = dataToSave.global.address;
        dataToSave.visualTexts['footer_address'] = dataToSave.global.address;
        dataToSave.visualTexts['cta_address_val'] = dataToSave.global.address;
        if (typeof localStorage !== 'undefined') {
          localStorage.setItem('vb_contacts_address_val', dataToSave.global.address);
          localStorage.setItem('vb_footer_address', dataToSave.global.address);
          localStorage.setItem('vb_cta_address_val', dataToSave.global.address);
        }
        window.dispatchEvent(new CustomEvent('vb_update', { detail: { id: 'contacts_address_val', text: dataToSave.global.address } }));
        window.dispatchEvent(new CustomEvent('vb_update', { detail: { id: 'footer_address', text: dataToSave.global.address } }));
        window.dispatchEvent(new CustomEvent('vb_update', { detail: { id: 'cta_address_val', text: dataToSave.global.address } }));
      }
      if (dataToSave.global.phone) {
        dataToSave.visualTexts['contacts_phone_val'] = dataToSave.global.phone;
        dataToSave.visualTexts['footer_phone'] = dataToSave.global.phone;
        dataToSave.visualTexts['header_phone'] = dataToSave.global.phone;
        dataToSave.visualTexts['cta_phone_val'] = dataToSave.global.phone;
        if (typeof localStorage !== 'undefined') {
          localStorage.setItem('vb_contacts_phone_val', dataToSave.global.phone);
          localStorage.setItem('vb_footer_phone', dataToSave.global.phone);
          localStorage.setItem('vb_header_phone', dataToSave.global.phone);
          localStorage.setItem('vb_cta_phone_val', dataToSave.global.phone);
        }
        window.dispatchEvent(new CustomEvent('vb_update', { detail: { id: 'contacts_phone_val', text: dataToSave.global.phone } }));
        window.dispatchEvent(new CustomEvent('vb_update', { detail: { id: 'footer_phone', text: dataToSave.global.phone } }));
        window.dispatchEvent(new CustomEvent('vb_update', { detail: { id: 'header_phone', text: dataToSave.global.phone } }));
        window.dispatchEvent(new CustomEvent('vb_update', { detail: { id: 'cta_phone_val', text: dataToSave.global.phone } }));
      }
      if (dataToSave.global.email) {
        dataToSave.visualTexts['contacts_email_val'] = dataToSave.global.email;
        dataToSave.visualTexts['footer_email'] = dataToSave.global.email;
        dataToSave.visualTexts['cta_email_val'] = dataToSave.global.email;
        if (typeof localStorage !== 'undefined') {
          localStorage.setItem('vb_contacts_email_val', dataToSave.global.email);
          localStorage.setItem('vb_footer_email', dataToSave.global.email);
          localStorage.setItem('vb_cta_email_val', dataToSave.global.email);
        }
        window.dispatchEvent(new CustomEvent('vb_update', { detail: { id: 'contacts_email_val', text: dataToSave.global.email } }));
        window.dispatchEvent(new CustomEvent('vb_update', { detail: { id: 'footer_email', text: dataToSave.global.email } }));
        window.dispatchEvent(new CustomEvent('vb_update', { detail: { id: 'cta_email_val', text: dataToSave.global.email } }));
      }
      if (dataToSave.global.companyName) {
        dataToSave.visualTexts['footer_company_title'] = dataToSave.global.companyName;
        if (typeof localStorage !== 'undefined') {
          localStorage.setItem('vb_footer_company_title', dataToSave.global.companyName);
        }
        window.dispatchEvent(new CustomEvent('vb_update', { detail: { id: 'footer_company_title', text: dataToSave.global.companyName } }));
      }
    }

    // Synchronize Founder / CEO fields across team[0], media.directorImage, and visualTexts
    if (dataToSave.visualTexts) {
      const fName = dataToSave.visualTexts['f_name'];
      const fPatr = dataToSave.visualTexts['f_patr'];
      const fRole = dataToSave.visualTexts['f_role'];
      const fQuote = dataToSave.visualTexts['f_quote'];
      const fullName = fName ? (fPatr ? `${fName} ${fPatr}` : fName) : undefined;

      if (fullName || fRole || fQuote || dataToSave.media?.directorImage) {
        dataToSave.team = dataToSave.team || [];
        if (dataToSave.team[0]) {
          dataToSave.team[0] = {
            ...dataToSave.team[0],
            ...(fullName ? { name: fullName } : {}),
            ...(fRole ? { badge: fRole, role: fRole } : {}),
            ...(fQuote ? { desc: fQuote } : {}),
            ...(dataToSave.media?.directorImage ? { img: dataToSave.media.directorImage } : {})
          };
        }
      }
    }

    if (!silent) {
      setIsSavingAdmin(true);
      setAdminSaveStatus(null);
    }
    
    // Save locally
    localStorage.setItem('spengeo_admin_data', JSON.stringify(dataToSave));

    try {
      const res = await fetch(getApiUrl('/api/admin/data'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dataToSave)
      });
      if (res.ok) {
        if (!silent) {
          setAdminSaveStatus({ type: 'success', text: 'вњ… Р’СЃРµ РёР·РјРµРЅРµРЅРёСЏ СѓСЃРїРµС€РЅРѕ СЃРѕС…СЂР°РЅРµРЅС‹ РЅР° СЃРµСЂРІРµСЂРµ Рё СЃРёРЅС…СЂРѕРЅРёР·РёСЂРѕРІР°РЅС‹ СЃ СЃР°Р№С‚РѕРј!' });
        }
        logEvent('Admin data saved to backend server & synced.', 'success');
      } else {
        if (!silent) {
          setAdminSaveStatus({ type: 'warning', text: 'рџ’ѕ РЎРѕС…СЂР°РЅРµРЅРѕ Р»РѕРєР°Р»СЊРЅРѕ РІ Р±СЂР°СѓР·РµСЂРµ (СЃРµСЂРІРµСЂ РѕС‚РІРµС‚РёР» СЃРѕ СЃС‚Р°С‚СѓСЃРѕРј ' + res.status + ').' });
        }
      }
    } catch (err) {
      if (!silent) {
        setAdminSaveStatus({ type: 'warning', text: 'рџ’ѕ РЎРѕС…СЂР°РЅРµРЅРѕ РІ Р»РѕРєР°Р»СЊРЅСѓСЋ РїР°РјСЏС‚СЊ Р±СЂР°СѓР·РµСЂР°.' });
      }
    } finally {
      if (!silent) {
        setIsSavingAdmin(false);
        setTimeout(() => {
          setAdminSaveStatus(null);
        }, 6000);
      }
    }
  };

  useEffect(() => {
    localStorage.setItem('spengeo_admin_data', JSON.stringify(adminData));
    
    if (isServerSyncRef.current) {
      isServerSyncRef.current = false;
      return; // Skip auto-save if this update was from server sync
    }

    // Auto-save debounced
    const timeout = setTimeout(() => {
      saveAdminData(adminData, true); // silent auto-save
    }, 1000);

    return () => clearTimeout(timeout);
  }, [adminData]);

  useEffect(() => {
    const handleSelect = (e) => {
      setActiveEditorElement(e.detail.id);
      setActiveEditorText(e.detail.text);
    };
    window.addEventListener('vb_select', handleSelect);
    return () => window.removeEventListener('vb_select', handleSelect);
  }, []);

  const markerRefs = useRef({});
  const [activeSubPage, setActiveSubPage] = useState(null);
  const [activePage, setActivePage] = useState(() => {
    const path = window.location.pathname.replace(/^\//, '');
    return ['home', 'about', 'services', 'projects', 'equipment', 'blog', 'documents', 'calculator', 'contacts', 'admin'].includes(path) ? path : 'home';
  });
  
  const SEO_METADATA = {
    home: { title: "РРЅР¶РµРЅРµСЂРЅС‹Рµ РёР·С‹СЃРєР°РЅРёСЏ РїРѕРґ РєР»СЋС‡ РІ РљР°Р·Р°С…СЃС‚Р°РЅРµ | РЎРїРµС†РРЅР¶Р“РµРѕ", desc: "РўРћРћ 'РЎРїРµС†РРЅР¶Р“РµРѕ' вЂ” РёРЅР¶РµРЅРµСЂРЅРѕ-РіРµРѕР»РѕРіРёС‡РµСЃРєРёРµ, РіРµРѕРґРµР·РёС‡РµСЃРєРёРµ, С‚РѕРїРѕРіСЂР°С„РёС‡РµСЃРєРёРµ РёР·С‹СЃРєР°РЅРёСЏ Рё Р»Р°Р±РѕСЂР°С‚РѕСЂРЅС‹Р№ Р°РЅР°Р»РёР· РіСЂСѓРЅС‚РѕРІ РїРѕ РІСЃРµР№ С‚РµСЂСЂРёС‚РѕСЂРёРё Р РµСЃРїСѓР±Р»РёРєРё РљР°Р·Р°С…СЃС‚Р°РЅ." },
    about: { title: "Рћ РєРѕРјРїР°РЅРёРё | РЎРїРµС†РРЅР¶Р“РµРѕ", desc: "РЈР·РЅР°Р№С‚Рµ Рѕ 'РЎРїРµС†РРЅР¶Р“РµРѕ' вЂ” Р»РёРґРµСЂРµ РІ СЃС„РµСЂРµ РёРЅР¶РµРЅРµСЂРЅС‹С… РёР·С‹СЃРєР°РЅРёР№ РІ РљР°Р·Р°С…СЃС‚Р°РЅРµ. РќР°С€Р° РјРёСЃСЃРёСЏ, РєРѕРјР°РЅРґР° СЌРєСЃРїРµСЂС‚РѕРІ Рё СЃРѕРІСЂРµРјРµРЅРЅРѕРµ РѕР±РѕСЂСѓРґРѕРІР°РЅРёРµ." },
    services: { title: "РќР°С€Рё СѓСЃР»СѓРіРё: Р“РµРѕР»РѕРіРёСЏ, Р“РµРѕРґРµР·РёСЏ, Р­РєРѕР»РѕРіРёСЏ | РЎРїРµС†РРЅР¶Р“РµРѕ", desc: "РџРѕР»РЅС‹Р№ РєРѕРјРїР»РµРєСЃ РёРЅР¶РµРЅРµСЂРЅС‹С… РёР·С‹СЃРєР°РЅРёР№ РґР»СЏ СЃС‚СЂРѕРёС‚РµР»СЊСЃС‚РІР°: РіРµРѕР»РѕРіРёС‡РµСЃРєРёРµ, РіРµРѕРґРµР·РёС‡РµСЃРєРёРµ, СЌРєРѕР»РѕРіРёС‡РµСЃРєРёРµ Рё РіРёРґСЂРѕРјРµС‚РµРѕСЂРѕР»РѕРіРёС‡РµСЃРєРёРµ РёСЃСЃР»РµРґРѕРІР°РЅРёСЏ." },
    projects: { title: "Р РµР°Р»РёР·РѕРІР°РЅРЅС‹Рµ РїСЂРѕРµРєС‚С‹ | РЎРїРµС†РРЅР¶Р“РµРѕ", desc: "РћР·РЅР°РєРѕРјСЊС‚РµСЃСЊ СЃ РїРѕСЂС‚С„РѕР»РёРѕ СѓСЃРїРµС€РЅРѕ Р·Р°РІРµСЂС€РµРЅРЅС‹С… РїСЂРѕРµРєС‚РѕРІ РўРћРћ 'РЎРїРµС†РРЅР¶Р“РµРѕ' РїРѕ РІСЃРµРјСѓ РљР°Р·Р°С…СЃС‚Р°РЅСѓ. Р‘СѓСЂРµРЅРёРµ, С‚РѕРїРѕСЃСЉРµРјРєР°, Р»Р°Р±РѕСЂР°С‚РѕСЂРёСЏ." },
    equipment: { title: "РќР°С€Р° С‚РµС…РЅРёРєР° Рё РѕР±РѕСЂСѓРґРѕРІР°РЅРёРµ | РЎРїРµС†РРЅР¶Р“РµРѕ", desc: "РЎРѕРІСЂРµРјРµРЅРЅС‹Р№ РїР°СЂРє Р±СѓСЂРѕРІРѕР№ СЃРїРµС†С‚РµС…РЅРёРєРё, РІРєР»СЋС‡Р°СЏ СѓСЃС‚Р°РЅРѕРІРєРё Bauer BG28, РџР‘РЈ-2 Рё РІС‹СЃРѕРєРѕС‚РѕС‡РЅРѕРµ РіРµРѕРґРµР·РёС‡РµСЃРєРѕРµ РѕР±РѕСЂСѓРґРѕРІР°РЅРёРµ." },
    documents: { title: "Р›РёС†РµРЅР·РёРё Рё СЃРµСЂС‚РёС„РёРєР°С‚С‹ | РЎРїРµС†РРЅР¶Р“РµРѕ", desc: "РћС„РёС†РёР°Р»СЊРЅС‹Рµ Р»РёС†РµРЅР·РёРё, СЃРµСЂС‚РёС„РёРєР°С‚С‹ Рё Р°РєРєСЂРµРґРёС‚Р°С†РёРё РўРћРћ 'РЎРїРµС†РРЅР¶Р“РµРѕ' РЅР° РїСЂРѕРІРµРґРµРЅРёРµ РёРЅР¶РµРЅРµСЂРЅС‹С… РёР·С‹СЃРєР°РЅРёР№ РІ РљР°Р·Р°С…СЃС‚Р°РЅРµ." },
    calculator: { title: "РљР°Р»СЊРєСѓР»СЏС‚РѕСЂ СЃС‚РѕРёРјРѕСЃС‚Рё РёР·С‹СЃРєР°РЅРёР№ | РЎРїРµС†РРЅР¶Р“РµРѕ", desc: "Р Р°СЃСЃС‡РёС‚Р°Р№С‚Рµ РїСЂРµРґРІР°СЂРёС‚РµР»СЊРЅСѓСЋ СЃС‚РѕРёРјРѕСЃС‚СЊ РёРЅР¶РµРЅРµСЂРЅРѕ-РіРµРѕР»РѕРіРёС‡РµСЃРєРёС… РёР·С‹СЃРєР°РЅРёР№ СЃ РїРѕРјРѕС‰СЊСЋ РЅР°С€РµРіРѕ РѕРЅР»Р°Р№РЅ-РєР°Р»СЊРєСѓР»СЏС‚РѕСЂР°." },
    contacts: { title: "РљРѕРЅС‚Р°РєС‚С‹ | РЎРїРµС†РРЅР¶Р“РµРѕ", desc: "РЎРІСЏР¶РёС‚РµСЃСЊ СЃ РЅР°РјРё РґР»СЏ Р·Р°РєР°Р·Р° РёРЅР¶РµРЅРµСЂРЅС‹С… РёР·С‹СЃРєР°РЅРёР№. РђРґСЂРµСЃ РѕС„РёСЃР°, С‚РµР»РµС„РѕРЅС‹, email Рё С„РѕСЂРјР° РѕР±СЂР°С‚РЅРѕР№ СЃРІСЏР·Рё." }
  };

  useEffect(() => {
    if (activePage === 'home') {
      window.history.pushState({}, '', '/');
    } else {
      window.history.pushState({}, '', `/${activePage}`);
    }
    
    // Dynamic SEO Updates
    const seo = SEO_METADATA[activePage] || SEO_METADATA.home;
    document.title = seo.title;
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute('content', seo.desc);
    }
  }, [activePage]);
  const [language, setLanguage] = useState('ru');
  const t = translations[language];
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [expandedMobileMenus, setExpandedMobileMenus] = useState({});
  const [certModal, setCertModal] = useState(null);

  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => { document.body.style.overflow = 'auto'; };
  }, [isMobileMenuOpen]);

  // Visual Builder States
  useEffect(() => {
    // Yandex Metrica
    if (adminData?.seo?.yandexMetricaId) {
      const ymId = adminData.seo.yandexMetricaId;
      if (!document.getElementById('yandex-metrica-script')) {
        const script = document.createElement('script');
        script.id = 'yandex-metrica-script';
        script.type = 'text/javascript';
        script.innerHTML = `
          (function(m,e,t,r,i,k,a){m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};
          m[i].l=1*new Date();
          for (var j = 0; j < document.scripts.length; j++) {if (document.scripts[j].src === r) { return; }}
          k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)})
          (window, document, "script", "https://mc.yandex.ru/metrika/tag.js", "ym");

          ym(${ymId}, "init", {
               clickmap:true,
               trackLinks:true,
               accurateTrackBounce:true,
               webvisor:true
          });
        `;
        document.head.appendChild(script);
      }
    }

    // Google Analytics
    if (adminData?.seo?.googleAnalyticsId) {
      const gaId = adminData.seo.googleAnalyticsId;
      if (!document.getElementById('google-analytics-script')) {
        const script1 = document.createElement('script');
        script1.async = true;
        script1.src = `https://www.googletagmanager.com/gtag/js?id=${gaId}`;
        document.head.appendChild(script1);

        const script2 = document.createElement('script');
        script2.id = 'google-analytics-script';
        script2.innerHTML = `
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${gaId}');
        `;
        document.head.appendChild(script2);
      }
    }
  }, [adminData?.seo?.yandexMetricaId, adminData?.seo?.googleAnalyticsId]);

  const [isVisualBuilder, setIsVisualBuilder] = useState(false);
  const [activeEditorElement, setActiveEditorElement] = useState(null);
  const [activeEditorText, setActiveEditorText] = useState("");
  const [vbHeroTitle, setVbHeroTitle] = useState(localStorage.getItem('vb_heroTitle') || '');
  const [vbHeroDesc, setVbHeroDesc] = useState(localStorage.getItem('vb_heroDesc') || '');

  useEffect(() => {
    if (vbHeroTitle) localStorage.setItem('vb_heroTitle', vbHeroTitle);
    if (vbHeroDesc) localStorage.setItem('vb_heroDesc', vbHeroDesc);
  }, [vbHeroTitle, vbHeroDesc]);

  // Hero Carousel State
  const [currentHeroSlide, setCurrentHeroSlide] = useState(0);
  const [isHeroHovered, setIsHeroHovered] = useState(false);

  useEffect(() => {
    if (activePage !== 'home' || isVisualBuilder || isHeroHovered) return;
    const timer = setInterval(() => {
      setCurrentHeroSlide((prev) => (prev + 1) % 4);
    }, 7000);
    return () => clearInterval(timer);
  }, [activePage, isVisualBuilder, isHeroHovered]);
  
  const activeSlide = t.hero.slides && t.hero.slides[currentHeroSlide] ? t.hero.slides[currentHeroSlide] : {
    subtitle: t.hero.subtitle,
    title: vbHeroTitle || t.hero.title,
    desc: vbHeroDesc || t.hero.desc,
    badge: 'РР—Р«РЎРљРђРќРРЇ',
    techText: 'SYS_CONNECTED\nAPI_OK // 8083'
  };
  const ActiveIcon = HERO_ICONS[currentHeroSlide] || Cpu;
  const activeIconColor = currentHeroSlide % 2 === 0 ? 'var(--color-accent)' : 'var(--color-cyan)';
  const activeTextColor = currentHeroSlide % 2 === 0 ? 'var(--color-cyan)' : 'var(--color-accent)';

  // Map Sync states
  const [activeProjectCoords, setActiveProjectCoords] = useState(null);
  const [kzGeoJson, setKzGeoJson] = useState(null);
  useEffect(() => {
    fetch('https://raw.githubusercontent.com/johan/world.geo.json/master/countries/KAZ.geo.json')
      .then(res => res.json())
      .then(data => setKzGeoJson(data))
      .catch(err => console.error("Failed to load KZ GeoJSON", err));
  }, []);
  const [activeMapZoom, setActiveMapZoom] = useState(5);
  
  // Interactive navigation submenu controllers
  const [activeServiceTab, setActiveServiceTab] = useState('geology');
  const [projectSearch, setProjectSearch] = useState('');
  const [blogSearch, setBlogSearch] = useState('');

  // Scroll to Top state
  const [showScrollTop, setShowScrollTop] = useState(false);

  // Theme state
  const [theme, setTheme] = useState('white');
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);
  
  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'white' : 'dark');
  };

  // AI Assistant State
  const [isAssistantOpen, setIsAssistantOpen] = useState(false);
  const [assistantMsgs, setAssistantMsgs] = useState([
    { sender: 'ai', text: 'Р—РґСЂР°РІСЃС‚РІСѓР№С‚Рµ! РЇ РР-Р°СЃСЃРёСЃС‚РµРЅС‚ РўРћРћ В«РЎРїРµС†РРЅР¶Р“РµРѕВ». Р§РµРј РјРѕРіСѓ РїРѕРјРѕС‡СЊ? РћС‚РІРµС‡Сѓ РЅР° РІРѕРїСЂРѕСЃС‹ РїРѕ РёР·С‹СЃРєР°РЅРёСЏРј, Р±СѓСЂРµРЅРёСЋ РёР»Рё СЃРјРµС‚Р°Рј.' }
  ]);
  const [assistantInput, setAssistantInput] = useState('');

  const handleAssistantSend = (e) => {
    e.preventDefault();
    if (!assistantInput.trim()) return;
    
    const newMsgs = [...assistantMsgs, { sender: 'user', text: assistantInput }];
    setAssistantMsgs(newMsgs);
    setAssistantInput('');
    
    setTimeout(() => {
      setAssistantMsgs([...newMsgs, { 
        sender: 'ai', 
        text: 'Рљ СЃРѕР¶Р°Р»РµРЅРёСЋ, СЃРµР№С‡Р°СЃ РІСЃРµ РЅР°С€Рё РёРЅР¶РµРЅРµСЂС‹ Р·Р°РЅСЏС‚С‹ РІ РїРѕР»СЏС… РёР»Рё Р»Р°Р±РѕСЂР°С‚РѕСЂРёРё. РџРѕР¶Р°Р»СѓР№СЃС‚Р°, РѕСЃС‚Р°РІСЊС‚Рµ РІР°С€ РЅРѕРјРµСЂ С‚РµР»РµС„РѕРЅР°, Рё РјС‹ РѕР±СЏР·Р°С‚РµР»СЊРЅРѕ РІР°Рј РїРµСЂРµР·РІРѕРЅРёРј!' 
      }]);
    }, 1500);
  };

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 300) {
        setShowScrollTop(true);
      } else {
        setShowScrollTop(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Active terminal logs state
  const [systemLogs, setSystemLogs] = useState([
    { time: '02:02:10', text: 'SPENGEO CLI Engine initialized successfully.', type: 'info' },
    { time: '02:02:12', text: 'Structure modernized: 7 Services, 50+ Projects, 100+ Blog posts active.', type: 'success' },
    { time: '02:02:15', text: 'Established link to Go DB at port 8083.', type: 'info' }
  ]);

  // Estimator States
  const [activeSoil, setActiveSoil] = useState('sand');
  const [drillDepth, setDrillDepth] = useState(15);
  const [buildArea, setBuildArea] = useState(250);
  const [waterTable, setWaterTable] = useState(false);
  const [seismicZone, setSeismicZone] = useState('9'); // Almaty 9, Astana 6

  // Technical database states
  const [equipCategory, setEquipCategory] = useState('rigs');
  const [selectedRig, setSelectedRig] = useState(0);
  const [selectedLab, setSelectedLab] = useState(0);

  // Lead Form States
  const [inquiryName, setInquiryName] = useState('');
  const [inquiryPhone, setInquiryPhone] = useState('');
  const [inquiryType, setInquiryType] = useState('geology');
  const [inquiryMsg, setInquiryMsg] = useState('');
  const [inquiryStatus, setInquiryStatus] = useState(null);

  // Admin States
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(() => {
    return localStorage.getItem('spengeo_admin_auth') === 'true';
  });
  const [adminUser, setAdminUser] = useState('');
  const [adminPass, setAdminPass] = useState('');
  const [inquiries, setInquiries] = useState([]);
  const [adminError, setAdminError] = useState('');
  const [activeAdminSection, setActiveAdminSection] = useState(() => {
    if (typeof window !== 'undefined' && window.location.hash) {
      const hash = window.location.hash.replace(/^#/, '');
      if (hash) return hash;
    }
    return localStorage.getItem('spengeo_active_admin_section') || 'dashboard';
  });

  useEffect(() => {
    if (activeAdminSection) {
      localStorage.setItem('spengeo_active_admin_section', activeAdminSection);
      if (activePage === 'admin') {
        window.history.replaceState({}, '', `/admin#${activeAdminSection}`);
      }
    }
  }, [activeAdminSection, activePage]);
  const [activeArticle, setActiveArticle] = useState(null);
  const dynamicMenu = adminData.menu || MENU_STRUCTURE;
  const [editingServiceIndex, setEditingServiceIndex] = useState(null);

  // Calculations
  const calcConfig = adminData.calc || { waterCoeff: 1.15, seismicCoeff9: 1.1, seismicCoeff6: 1.0, holeAreaDivisor: 120, drillSpeedPerDay: 22, soilSandPrice: 18500, soilClayPrice: 22200, soilLoamPrice: 20350, soilRockPrice: 46250, soilPeatPrice: 27750 };
  const currentSoils = {
    sand: { ...SOILS.sand, price: calcConfig.soilSandPrice || 18500 },
    clay: { ...SOILS.clay, price: calcConfig.soilClayPrice || 22200 },
    loam: { ...SOILS.loam, price: calcConfig.soilLoamPrice || 20350 },
    rock: { ...SOILS.rock, price: calcConfig.soilRockPrice || 46250 },
    peat: { ...SOILS.peat, price: calcConfig.soilPeatPrice || 27750 }
  };
  const selectedSoilConfig = currentSoils[activeSoil];
  
  const holeCount = Math.max(3, Math.ceil(buildArea / calcConfig.holeAreaDivisor) + (seismicZone === '9' ? 1 : 0));
  const totalDrillLength = holeCount * drillDepth;
  const waterCoeff = waterTable ? calcConfig.waterCoeff : 1.0;
  const seismicCoeff = seismicZone === '9' ? calcConfig.seismicCoeff9 : calcConfig.seismicCoeff6;
  const estimatedCost = Math.round(totalDrillLength * selectedSoilConfig.price * waterCoeff * seismicCoeff);
  const estimatedDuration = Math.max(3, Math.ceil(totalDrillLength / calcConfig.drillSpeedPerDay));
  const sampleCount = holeCount * Math.max(2, Math.floor(drillDepth / 5));

  const logEvent = (text, type = 'info') => {
    const timestamp = new Date().toTimeString().split(' ')[0];
    setSystemLogs(prev => [...prev, { time: timestamp, text, type }].slice(-12));
  };

  useEffect(() => {
    if (activePage === 'admin') {
      fetchInquiries();
    }
  }, [activePage]);

  const fetchInquiries = async () => {
    logEvent('Connecting to inquiries JSON endpoint...', 'info');
    try {
      const res = await fetch(getApiUrl('/api/inquiries'));
      if (res.ok) {
        const data = await res.json();
        setInquiries(data || []);
        logEvent(`Pulled ${data ? data.length : 0} rows from backend.`, 'success');
      } else {
        loadSimulatedInquiries();
      }
    } catch (e) {
      loadSimulatedInquiries();
    }
  };

  const loadSimulatedInquiries = () => {
    logEvent('Failed to bind API. Loading local session database.', 'warning');
    const simulated = [
      { id: 1, name: 'РўРћРћ BI Group (РђР»РјР°С‚С‹)', phone: '+7 705 333 44 55', service_type: 'both', message: 'РР·С‹СЃРєР°РЅРёСЏ РїРѕРґ Р–Рљ РІ РђР»РјР°С‚С‹, 15 СЃРєРІР°Р¶РёРЅ РїРѕ 30 РјРµС‚СЂРѕРІ. Р’РѕРґРѕРЅР°СЃС‹С‰РµРЅРЅС‹Рµ РїРµСЃРєРё.', created_at: new Date(Date.now() - 3600000 * 2).toISOString() },
      { id: 2, name: 'Air Astana Hangar Project', phone: '+7 701 987 65 43', service_type: 'both', message: 'Р‘СѓСЂРµРЅРёРµ РїРѕРґ Р°РЅРіР°СЂ. РЁР°СЃСЃРё РљР°РјР°Р·/Bauer.', created_at: new Date(Date.now() - 3600000 * 24).toISOString() },
      { id: 3, name: 'Mega Garden Mall Development', phone: '+7 777 555 11 22', service_type: 'geology', message: 'Р“РёРґСЂРѕРіРµРѕР»РѕРіРёС‡РµСЃРєРёРµ РёСЃРїС‹С‚Р°РЅРёСЏ Рё РјРѕРґСѓР»СЊ РґРµС„РѕСЂРјР°С†РёРё.', created_at: new Date(Date.now() - 3600000 * 48).toISOString() }
    ];
    setInquiries(simulated);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setInquiryStatus(null);
    logEvent(`Dispatching lead for ${inquiryName}...`, 'info');

    if (!inquiryName || !inquiryPhone) {
      setInquiryStatus({ type: 'error', text: 'РџРѕР¶Р°Р»СѓР№СЃС‚Р° Р·Р°РїРѕР»РЅРёС‚Рµ РёРјСЏ Рё С‚РµР»РµС„РѕРЅ!' });
      return;
    }

    const payload = {
      name: inquiryName,
      phone: inquiryPhone,
      service_type: inquiryType,
      message: inquiryMsg || `РЎРјРµС‚РЅС‹Р№ РєР°Р»СЊРєСѓР»СЏС‚РѕСЂ: РїСЏС‚РЅРѕ ${buildArea}РјВІ, РіР»СѓР±РёРЅР° ${drillDepth}Рј, РіСЂСѓРЅС‚: ${selectedSoilConfig.name}`
    };

    try {
      const res = await fetch(getApiUrl('/api/inquiries'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        setInquiryStatus({ type: 'success', text: 'Р—Р°СЏРІРєР° Р·Р°СЂРµРіРёСЃС‚СЂРёСЂРѕРІР°РЅР° РІ Р±СЌРєРµРЅРґРµ Go!' });
        logEvent('Go API response: 201 created. Sync OK.', 'success');
        resetForm();
      } else {
        saveToLocalInquiries(payload);
        setInquiryStatus({ type: 'success', text: 'Р—Р°СЏРІРєР° РѕС‚РїСЂР°РІР»РµРЅР° (Р°РєС‚РёРІРёСЂРѕРІР°РЅР° Р»РѕРєР°Р»СЊРЅР°СЏ СЃРµСЃСЃРёСЏ)' });
        resetForm();
      }
    } catch (err) {
      saveToLocalInquiries(payload);
      setInquiryStatus({ type: 'success', text: 'Р—Р°СЏРІРєР° РѕС‚РїСЂР°РІР»РµРЅР° (СЃРѕС…СЂР°РЅРµРЅРѕ Р°РІС‚РѕРЅРѕРјРЅРѕ)' });
      logEvent('Go backend API offline. Saved inquiry to offline index.', 'warning');
      resetForm();
    }
  };

  const saveToLocalInquiries = (payload) => {
    const current = JSON.parse(localStorage.getItem('spengeo_inquiries') || '[]');
    current.unshift({
      id: Date.now(),
      ...payload,
      created_at: new Date().toISOString()
    });
    localStorage.setItem('spengeo_inquiries', JSON.stringify(current));
  };

  const resetForm = () => {
    setInquiryName('');
    setInquiryPhone('');
    setInquiryMsg('');
  };

  const handleAdminLogin = async (e) => {
    e.preventDefault();
    logEvent('Checking credentials...', 'info');

    // SECURITY: Safe placeholder for IP restriction (user requested 195.245.96.252) - CURRENTLY DISABLED
    const ALLOWED_IP = ""; // Set to "195.245.96.252" to re-enable
    
    // Check IP
    if (ALLOWED_IP !== "") {
      try {
        const ipRes = await fetch('https://api.ipify.org?format=json');
        const ipData = await ipRes.json();
        if (ipData.ip !== ALLOWED_IP) {
          setAdminError('Р”РѕСЃС‚СѓРї Р·Р°РїСЂРµС‰РµРЅ. РќРµРІРµСЂРЅС‹Р№ IP Р°РґСЂРµСЃ.');
          logEvent(`IP rejected: ${ipData.ip}`, 'error');
          return;
        }
      } catch (err) {
        setAdminError('РћС€РёР±РєР° РїСЂРѕРІРµСЂРєРё IP Р°РґСЂРµСЃР°. РџСЂРѕРІРµСЂСЊС‚Рµ СЃРѕРµРґРёРЅРµРЅРёРµ.');
        return;
      }
    }

    const u = adminUser.trim();
    const p = adminPass.trim();

    // MAIN ACCOUNT check (requested claower / 04071219Mm. & spetsinggeo / Ggg181930!)
    // Note: It's generally unsafe to hardcode passwords in frontend code. 
    // This is implemented exactly as requested, but in production consider a backend auth system.
    if (
      (u.toLowerCase() === 'claower' && p === '04071219Mm.') ||
      (u.toLowerCase() === 'spetsinggeo' && p === 'Ggg181930!')
    ) {
      setIsAdminLoggedIn(true);
      localStorage.setItem('spengeo_admin_auth', 'true');
      setAdminError('');
      logEvent(`Admin Session ACTIVE (${u}).`, 'success');
    } 
    // Fallback legacy access
    else if (p.toLowerCase() === 'admin' && !u) {
      setIsAdminLoggedIn(true);
      localStorage.setItem('spengeo_admin_auth', 'true');
      setAdminError('');
      logEvent('Admin Session ACTIVE (Legacy).', 'success');
    } else {
      setAdminError('РќРµРІРµСЂРЅС‹Р№ Р»РѕРіРёРЅ РёР»Рё РїР°СЂРѕР»СЊ.');
      logEvent('Failed login attempt.', 'error');
    }
  };

  const handleClearInquiry = async (id) => {
    logEvent(`Deleting record: ${id}...`, 'info');
    try {
      const res = await fetch(getApiUrl(`/api/inquiries/${id}`), { method: 'DELETE' });
      if (res.ok) {
        setInquiries(prev => prev.filter(item => item.id !== id));
        logEvent('Go database entry successfully removed.', 'success');
      } else {
        setInquiries(prev => prev.filter(item => item.id !== id));
      }
    } catch (e) {
      setInquiries(prev => prev.filter(item => item.id !== id));
    }
  };

  const currentProjects = adminData.projects && adminData.projects.length > 0 ? adminData.projects : DETAILED_PROJECTS;
  const filteredProjects = currentProjects.filter(p => 
    p.name.toLowerCase().includes(projectSearch.toLowerCase()) || 
    p.client.toLowerCase().includes(projectSearch.toLowerCase()) ||
    p.loc.toLowerCase().includes(projectSearch.toLowerCase()) ||
    p.type.toLowerCase().includes(projectSearch.toLowerCase())
  );

  return (
    <>
      <div style={{
        ...(isVisualBuilder ? { paddingTop: '60px', paddingLeft: '300px', paddingRight: '300px', height: '100vh', overflow: 'hidden', background: '#0a0a0a', transition: 'all 0.3s ease' } : {}),
        '--crust-bg': adminData.media?.crustBg ? `url(${adminData.media.crustBg})` : 'url(/images/geodesy_surface_bg.png)',
        '--aquifers-bg': adminData.media?.aquifersBg ? `url(${adminData.media.aquifersBg})` : 'url(/images/geology_bg_2.png)',
        '--mantle-bg': adminData.media?.mantleBg ? `url(${adminData.media.mantleBg})` : 'url(/images/geology_bg_3.png)'
      }}>
        <div style={isVisualBuilder ? { height: '100%', width: '100%', overflowY: 'auto', position: 'relative', boxShadow: '0 0 50px rgba(0,0,0,0.8)', borderLeft: '1px solid #333', borderRight: '1px solid #333', backgroundColor: 'var(--bg-main)' } : {}}>
      <div className="blueprint-bg"></div>
      <div className="bg-glow-orb bg-glow-orb-1"></div>
      <div className="bg-glow-orb bg-glow-orb-2"></div>

      {activePage !== 'admin' && (
        <>
          {/* High-Tech Top Status Bar */}
          <div className="status-bar">
            <div className="container status-bar-content">
              <div className="status-indicator">
                <div className="status-dot"></div>
                <span><EditableText id="top_status_title" defaultText="РўРћРћ РЎРџР•Р¦РРќР–Р“Р•Рћ // РЎРўРђРўРЈРЎ РЎРРЎРўР•РњР«: РђРљРўРР’Р•Рќ" isVisualBuilder={isVisualBuilder} /></span>
              </div>
              <div>
                <span><EditableText id="top_status_info" defaultText="Р‘Р­РљР•РќР”: GOLANG | Р¤Р РћРќРўР•РќР”: REACT | Р›РР¦Р•РќР—РРЇ: Р“РЎР› в„–19004562" isVisualBuilder={isVisualBuilder} /></span>
              </div>
            </div>
          </div>

          {/* Modern Grid Navigation Bar */}
          <header className="header">
            <div className="container nav-container">
              <a href="/" className="logo" onClick={(e) => { e.preventDefault(); setActivePage('home'); }} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <img src="/images/logo.png" alt="SpenGeo Logo" style={{ height: '45px', width: 'auto' }} />
                <span>РЎРїРµС†<span>РРЅР¶</span>Р“РµРѕ</span>
              </a>

              <nav className="desktop-nav">
                <ul className="nav-links">
                  {(dynamicMenu[language] || dynamicMenu.ru).map((menu, i) => (
                    <li key={i} className={menu.items ? "nav-item-with-dropdown" : ""}>
                      <a 
                        href={menu.action && menu.action.type === 'page' ? (menu.action.val === 'home' ? '/' : `/${menu.action.val}`) : '#'}
                        className={`nav-btn ${activePage === menu.page || (menu.page === 'about' && activePage === 'documents') ? 'active' : ''}`} 
                        onClick={(e) => {
                          if (menu.action && menu.action.type === 'page') e.preventDefault();
                          if (menu.action) {
                            if (menu.action.type === 'page') {
                              setActivePage(menu.action.val);
                              setActiveSubPage(menu.action.subpage || null);
                            }
                          }
                        }}
                      >
                        {menu.title}
                      </a>
                      
                      {menu.items && (
                        <div className={`dropdown-menu ${menu.columns ? 'dropdown-menu-wide' : ''}`}>
                          {menu.items.map((item, j) => (
                            <a 
                              key={j} 
                              href={item.action.type === 'page' ? (item.action.val === 'home' ? '/' : `/${item.action.val}`) : '#'}
                              className="dropdown-item" 
                              onClick={(e) => {
                                if (item.action.type === 'page' || item.action.type === 'service' || item.action.type === 'equip') e.preventDefault();
                                if (item.action.type === 'page') {
                                  setActivePage(item.action.val);
                                  setActiveSubPage(item.action.subpage || null);
                                } else if (item.action.type === 'scroll') {
                                  e.preventDefault();
                                  setActivePage(item.action.page);
                                  setTimeout(() => {
                                    const el = document.getElementById(item.action.target);
                                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                                  }, 100);
                                } else if (item.action.type === 'service') {
                                  setActiveServiceTab(item.action.val);
                                  setActivePage('services');
                                } else if (item.action.type === 'equip') {
                                  setEquipCategory(item.action.cat);
                                  if (item.action.cat === 'rigs') {
                                    if (typeof setSelectedRig === 'function') setSelectedRig(item.action.idx);
                                  } else {
                                    if (typeof setSelectedLab === 'function') setSelectedLab(item.action.idx);
                                  }
                                  setActivePage('equipment');
                                }
                              }}
                            >
                              {item.name}
                            </a>
                          ))}
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
              </nav>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0 }} className="header-actions">
                
                <button onClick={toggleTheme} style={{ background: 'none', border: 'none', color: 'var(--color-cyan)', cursor: 'pointer', display: 'flex', alignItems: 'center' }} title="РџРµСЂРµРєР»СЋС‡РёС‚СЊ С‚РµРјСѓ">
                  {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
                </button>
                
                <a href={`tel:${(adminData.global?.phone || '+7 705 969 0101').replace(/[^\d+]/g, '')}`} className="header-phone-btn" style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--color-cyan)', color: '#07090e', padding: '8px 16px', borderRadius: '30px', textDecoration: 'none', fontWeight: 'bold', whiteSpace: 'nowrap', fontSize: '0.95rem' }}>
                  <Phone size={16} /> {adminData.global?.phone || '+7 705 969 0101'}
                </a>
              </div>
              
              <button className="mobile-menu-btn" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
                {isMobileMenuOpen ? <X size={28} color="var(--color-cyan)"/> : <Menu size={28} color="var(--color-cyan)"/>}
              </button>
            </div>
            
            {/* Mobile Navigation Panel */}
            {isMobileMenuOpen && (
              <div className="mobile-nav-panel">
                <ul className="mobile-nav-links">
                  {(dynamicMenu[language] || dynamicMenu.ru).map((menu, i) => (
                    <li key={i} className={`mobile-nav-item ${expandedMobileMenus[i] ? 'expanded' : ''}`}>
                      <div className="mobile-nav-item-header">
                        <a 
                          href={menu.action && menu.action.type === 'page' ? (menu.action.val === 'home' ? '/' : `/${menu.action.val}`) : '#'}
                          className={activePage === menu.page ? 'active' : ''}
                          onClick={(e) => {
                            if (menu.action && menu.action.type === 'page') {
                              e.preventDefault();
                              setActivePage(menu.action.val);
                              setActiveSubPage(menu.action.subpage || null);
                              setIsMobileMenuOpen(false);
                              setExpandedMobileMenus({});
                            } else if (menu.items) {
                              e.preventDefault();
                              setExpandedMobileMenus(prev => ({ ...prev, [i]: !prev[i] }));
                            }
                          }}
                        >
                          {menu.title}
                        </a>
                        {menu.items && (
                          <button 
                            className="mobile-expand-btn"
                            onClick={(e) => { 
                              e.stopPropagation(); 
                              e.preventDefault();
                              setExpandedMobileMenus(prev => ({ ...prev, [i]: !prev[i] })); 
                            }}
                          >
                            <ChevronDown size={20} className={`expand-icon ${expandedMobileMenus[i] ? 'rotated' : ''}`} />
                          </button>
                        )}
                      </div>
                      {menu.items && (
                        <div className={`mobile-submenu ${expandedMobileMenus[i] ? 'open' : ''}`}>
                          {menu.items.map((item, j) => (
                            <a 
                              key={j} 
                              href={item.action && item.action.type === 'page' ? (item.action.val === 'home' ? '/' : `/${item.action.val}`) : '#'}
                              className="mobile-submenu-item"
                              onClick={(e) => {
                                if (item.action.type === 'page' || item.action.type === 'service' || item.action.type === 'equip') e.preventDefault();
                                if (item.action.type === 'page') {
                                  setActivePage(item.action.val);
                                  setActiveSubPage(item.action.subpage || null);
                                  setIsMobileMenuOpen(false);
                                  setExpandedMobileMenus({});
                                } else if (item.action.type === 'scroll') {
                                  e.preventDefault();
                                  setActivePage(item.action.page);
                                  setTimeout(() => {
                                    const el = document.getElementById(item.action.target);
                                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                                  }, 100);
                                  setIsMobileMenuOpen(false);
                                  setExpandedMobileMenus({});
                                } else if (item.action.type === 'service') {
                                  setActiveServiceTab(item.action.val);
                                  setActivePage('services');
                                  setIsMobileMenuOpen(false);
                                  setExpandedMobileMenus({});
                                } else if (item.action.type === 'equip') {
                                  setEquipCategory(item.action.cat);
                                  if (item.action.cat === 'rigs') {
                                    if (typeof setSelectedRig === 'function') setSelectedRig(item.action.idx);
                                  } else if (item.action.cat === 'tools') {
                                    if (typeof setSelectedTool === 'function') setSelectedTool(item.action.idx);
                                  }
                                  setActivePage('equipment');
                                  setIsMobileMenuOpen(false);
                                  setExpandedMobileMenus({});
                                }
                              }}
                            >
                              {item.title || item.name}
                            </a>
                          ))}
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
                <div className="mobile-nav-footer">
                  
                  <button onClick={toggleTheme} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '10px', color: 'var(--color-cyan)', cursor: 'pointer' }}>
                    {theme === 'dark' ? <Sun size={24} /> : <Moon size={24} />}
                  </button>
                </div>
                <a href="tel:+77059690101" style={{ display: 'block', textAlign: 'center', marginTop: '20px', background: 'var(--color-cyan)', color: '#07090e', padding: '15px', borderRadius: '8px', textDecoration: 'none', fontWeight: 'bold' }}>
                  <Phone size={18} style={{verticalAlign:'middle', marginRight:'8px'}}/> РџРѕР·РІРѕРЅРёС‚СЊ СЃРµР№С‡Р°СЃ
                </a>
              </div>
            )}
          </header>
        </>
      )}

      {/* Pages Container */}
      <main className="container" style={{ minHeight: 'calc(100vh - 120px)', paddingBlock: '50px' }}>
        
        {/* ==================== PAGE: HOME ==================== */}
        {activePage === 'home' && (
          <div className="page-wrapper page-enter">
            <div className="geological-layer crust-layer">
              <section 
                className="hero-section full-width-bleed"
                onMouseEnter={() => setIsHeroHovered(true)}
                onMouseLeave={() => setIsHeroHovered(false)}
              >
              <video 
                className="hero-video-bg" 
                autoPlay 
                muted 
                playsInline 
                poster="/images/hero.png"
                onEnded={(e) => {
                  e.target.currentTime = 5.5;
                  e.target.play();
                }}
                onLoadedMetadata={(e) => {
                  e.target.currentTime = 5.5;
                }}
              >
                <source src="/videos/hero.mp4" type="video/mp4" />
              </video>
              <div className="hero-overlay"></div>
              <div className="hero-content-container">
                <div className="hero-content" style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '50px', alignItems: 'center', minHeight: '55vh' }}>
                  
                  {/* Left Side: Animated Slide Contents */}
                  <div key={currentHeroSlide} className="hero-slide-animation">
                    <span className="hero-subtitle">{activeSlide.subtitle}</span>
                    <h1 
                      style={{ 
                        fontSize: 'clamp(2.2rem, 5vw, 3.8rem)', 
                        color: '#fff', 
                        textShadow: '0 4px 20px rgba(0,0,0,0.8)', 
                        outline: isVisualBuilder ? '2px dashed var(--color-accent)' : 'none', 
                        padding: isVisualBuilder ? '5px' : 0, 
                        borderRadius: '8px', 
                        cursor: isVisualBuilder ? 'text' : 'default', 
                        transition: 'outline 0.3s ease' 
                      }}
                      contentEditable={isVisualBuilder}
                      suppressContentEditableWarning={true}
                      onBlur={(e) => {
                        if (t.hero.slides && t.hero.slides[currentHeroSlide]) {
                          t.hero.slides[currentHeroSlide].title = e.currentTarget.textContent;
                        }
                      }}
                    >
                      {activeSlide.title}
                    </h1>
                    <p 
                      style={{ 
                        color: '#f8fafc', 
                        fontSize: '1.05rem', 
                        marginBottom: '30px', 
                        maxWidth: '620px', 
                        textShadow: '0 2px 10px rgba(0,0,0,0.8)', 
                        outline: isVisualBuilder ? '2px dashed var(--color-accent)' : 'none', 
                        padding: isVisualBuilder ? '5px' : 0, 
                        borderRadius: '8px', 
                        cursor: isVisualBuilder ? 'text' : 'default', 
                        transition: 'outline 0.3s ease' 
                      }}
                      contentEditable={isVisualBuilder}
                      suppressContentEditableWarning={true}
                      onBlur={(e) => {
                        if (t.hero.slides && t.hero.slides[currentHeroSlide]) {
                          t.hero.slides[currentHeroSlide].desc = e.currentTarget.textContent;
                        }
                      }}
                    >
                      {activeSlide.desc}
                    </p>
                    
                    <div style={{ display: 'flex', gap: '20px', alignItems: 'center', flexWrap: 'wrap' }}>
                      <div className="hero-buttons">
                        <button className="btn btn-primary" onClick={() => setActivePage('calculator')}>
                          {t.hero.btnCalc} <ArrowUpRight size={18} />
                        </button>
                        <button className="btn btn-secondary" onClick={() => setActivePage('services')} style={{ background: 'rgba(255,255,255,0.05)', borderColor: 'rgba(255,255,255,0.2)' }}>
                          {t.hero.btnServices}
                        </button>
                      </div>
                      
                      {/* Arrow Navigation */}
                      <div className="hero-nav-arrows">
                        <button 
                          className="hero-nav-arrow-btn" 
                          onClick={(e) => {
                            e.stopPropagation();
                            setCurrentHeroSlide(prev => (prev - 1 + 4) % 4);
                          }}
                          aria-label="Previous Slide"
                        >
                          <ChevronRight size={18} style={{ transform: 'rotate(180deg)' }} />
                        </button>
                        <button 
                          className="hero-nav-arrow-btn" 
                          onClick={(e) => {
                            e.stopPropagation();
                            setCurrentHeroSlide(prev => (prev + 1) % 4);
                          }}
                          aria-label="Next Slide"
                        >
                          <ChevronRight size={18} />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Right Side: Interactive HUD graphic linked to slide */}
                  <div className="tech-graphic-container" key={`graphic-${currentHeroSlide}`}>
                    <div className="tech-ring" style={{ width: '360px', height: '360px', borderColor: activeIconColor + '22' }}>
                      <div className="tech-ring-inner" style={{ width: '270px', height: '270px', borderColor: activeTextColor + '22' }}></div>
                    </div>
                    <div className="tech-drill-icon" style={{ width: '160px', height: '160px', background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(10px)', borderColor: activeIconColor + '33' }}>
                      <div style={{ textAlign: 'center' }}>
                        <ActiveIcon size={50} color={activeIconColor} style={{ marginBottom: '8px', filter: `drop-shadow(0 0 10px ${activeIconColor})` }} />
                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.68rem', color: activeTextColor, letterSpacing: '0.12em', whiteSpace: 'pre-line', lineHeight: '1.4' }}>
                          {activeSlide.techText}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Progress Indicators */}
                {t.hero.slides && (
                  <div className="hero-slide-indicators">
                    {t.hero.slides.map((slide, idx) => (
                      <button
                        key={idx}
                        className={`hero-indicator-btn ${currentHeroSlide === idx ? 'active' : ''}`}
                        onClick={() => setCurrentHeroSlide(idx)}
                      >
                        <span className="hero-indicator-number" style={{ color: currentHeroSlide === idx ? activeIconColor : 'var(--color-text-secondary)' }}>0{idx + 1}</span>
                        <span className="hero-indicator-label">{slide.badge}</span>
                        <span className="hero-indicator-bar-bg">
                          <span 
                            className="hero-indicator-bar-fill"
                            style={{
                              width: currentHeroSlide === idx ? '100%' : '0%',
                              background: `linear-gradient(to right, ${activeIconColor}, ${activeTextColor})`,
                              transition: currentHeroSlide === idx && !isHeroHovered && !isVisualBuilder ? 'width 7s linear' : 'none'
                            }}
                          ></span>
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </section>

            {/* 1.5. Clients / Partners (Moved above stats) */}
            <section style={{ marginBottom: '60px', textAlign: 'center', position: 'relative', overflow: 'visible', padding: '40px 0' }}>
               <div className="bg-glow-orb" style={{ top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '1000px', height: '400px', opacity: 0.08, background: 'radial-gradient(ellipse, var(--color-cyan) 0%, transparent 70%)' }}></div>
               <EditableText id="clients_subtitle" defaultText="РќРђРњ Р”РћР’Р•Р РЇР®Рў" isVisualBuilder={isVisualBuilder} className="hero-subtitle" style={{ color: 'var(--color-accent)', textShadow: '0 0 15px rgba(59, 130, 246, 0.6)' }} />
               <EditableText as="h2" id="clients_title" defaultText={t.sections.clientsTitle} isVisualBuilder={isVisualBuilder} style={{ fontSize: '3.2rem', marginBottom: '40px', textShadow: '0 0 40px rgba(255,255,255,0.2)' }} />
               
               <div className="marquee-container" style={{ position: 'relative', zIndex: 2, marginTop: '20px' }}>
                 <div className="marquee-content">
                   {/* Double array for seamless infinite scroll */}
                   {[...['BI Group', 'Air Astana', 'QazaqGaz', 'Mega Center', 'Bazis-A', 'RAMS Qazaqstan', 'KazMinerals'], ...['BI Group', 'Air Astana', 'QazaqGaz', 'Mega Center', 'Bazis-A', 'RAMS Qazaqstan', 'KazMinerals']].map((client, idx) => (
                     <div key={idx} className="client-card-premium">
                       <span className="client-name-gradient">{client}</span>
                     </div>
                   ))}
                 </div>
               </div>
            </section>

            <div className="geological-layer-content">
              {/* Quick KPI stats dashboard */}
              <div style={{ textAlign: 'center', marginBottom: '40px', position: 'relative', zIndex: 2 }}>
                 <EditableText id="stats_subtitle" defaultText={t.stats.subtitle} isVisualBuilder={isVisualBuilder} className="hero-subtitle" style={{ color: 'var(--color-cyan)', textShadow: '0 0 15px rgba(6, 182, 212, 0.6)' }} />
                 <EditableText as="h2" id="stats_title" defaultText={t.stats.title} isVisualBuilder={isVisualBuilder} style={{ fontSize: '3.2rem', textShadow: '0 0 40px rgba(255,255,255,0.2)' }} />
              </div>
              
              <section className="container bento-grid" style={{ paddingBottom: '100px', position: 'relative', zIndex: 10 }}>
                {/* 2x2 Large Card */}
                <div className="glow-card-premium bento-card bento-large float-slow">
                  <div style={{ position: 'absolute', right: '-40px', bottom: '-40px', opacity: 0.03 }}><Hammer size={300} /></div>
                  <div style={{ background: 'rgba(59, 130, 246, 0.1)', padding: '15px', borderRadius: '15px', marginBottom: '30px', display: 'inline-block', width: 'max-content' }}>
                    <Hammer size={32} color="var(--color-accent)" />
                  </div>
                  <EditableText id="stats_wells" defaultText={t.stats.wells} isVisualBuilder={isVisualBuilder} className="spec-label" style={{ marginBottom: '15px', color: 'var(--color-text-primary)' }} />
                  <EditableText id="stats_wells_val" defaultText="1,420+" isVisualBuilder={isVisualBuilder} as="div" className="spec-val" style={{ fontSize: 'clamp(4rem, 8vw, 6rem)', fontWeight: 900, color: 'var(--color-accent)', fontFamily: 'var(--font-display)', lineHeight: 1, marginBottom: '20px', textShadow: '0 0 30px rgba(59, 130, 246, 0.5)' }} />
                  <EditableText id="stats_wells_desc" defaultText={t.stats.wellsDesc} isVisualBuilder={isVisualBuilder} as="p" style={{ fontSize: '1.1rem', color: 'var(--color-text-secondary)', margin: 0, lineHeight: 1.8, position: 'relative', zIndex: 2, maxWidth: '80%' }} />
                </div>

                {/* 1x1 Card */}
                <div className="glow-card-premium bento-card float-reverse">
                  <div style={{ position: 'absolute', right: '-20px', top: '-20px', opacity: 0.03 }}><MapPin size={150} /></div>
                  <div style={{ background: 'rgba(6, 182, 212, 0.1)', padding: '12px', borderRadius: '12px', marginBottom: '20px', display: 'inline-block', width: 'max-content' }}>
                    <MapPin size={24} color="var(--color-cyan)" />
                  </div>
                  <EditableText id="stats_geo" defaultText={t.stats.geo} isVisualBuilder={isVisualBuilder} className="spec-label" style={{ marginBottom: '10px' }} />
                  <EditableText id="stats_geo_val" defaultText={t.stats.geoValue} isVisualBuilder={isVisualBuilder} as="div" style={{ fontSize: '3rem', fontWeight: 800, color: 'var(--color-cyan)', fontFamily: 'var(--font-mono)', lineHeight: 1, marginBottom: '15px', textShadow: '0 0 20px rgba(6, 182, 212, 0.4)' }} />
                  <EditableText id="stats_geo_desc" defaultText={t.stats.geoDesc} isVisualBuilder={isVisualBuilder} as="p" style={{ fontSize: '0.95rem', color: 'var(--color-text-secondary)', margin: 0, lineHeight: 1.6, position: 'relative', zIndex: 2 }} />
                </div>

                {/* 1x1 Card */}
                <div className="glow-card-premium bento-card float-slow">
                  <div style={{ position: 'absolute', right: '-20px', top: '-20px', opacity: 0.03 }}><Award size={150} /></div>
                  <div style={{ background: 'rgba(59, 130, 246, 0.1)', padding: '12px', borderRadius: '12px', marginBottom: '20px', display: 'inline-block', width: 'max-content' }}>
                    <Award size={24} color="var(--color-accent)" />
                  </div>
                  <EditableText id="stats_standards" defaultText={t.stats.standards} isVisualBuilder={isVisualBuilder} className="spec-label" style={{ marginBottom: '10px' }} />
                  <EditableText id="stats_standards_val" defaultText="100%" isVisualBuilder={isVisualBuilder} as="div" style={{ fontSize: '3rem', fontWeight: 800, color: 'var(--color-accent)', fontFamily: 'var(--font-mono)', lineHeight: 1, marginBottom: '15px', textShadow: '0 0 20px rgba(59, 130, 246, 0.4)' }} />
                  <EditableText id="stats_standards_desc" defaultText={t.stats.standardsDesc} isVisualBuilder={isVisualBuilder} as="p" style={{ fontSize: '0.95rem', color: 'var(--color-text-secondary)', margin: 0, lineHeight: 1.6, position: 'relative', zIndex: 2 }} />
                </div>

                {/* 2x1 Wide Card */}
                <div className="glow-card-premium bento-card bento-wide float-fast" style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ background: 'rgba(6, 182, 212, 0.1)', padding: '12px', borderRadius: '12px', marginBottom: '15px', display: 'inline-block', width: 'max-content' }}>
                      <Settings size={24} color="var(--color-cyan)" />
                    </div>
                    <EditableText id="stats_fleet" defaultText={t.stats.fleet} isVisualBuilder={isVisualBuilder} className="spec-label" style={{ marginBottom: '10px' }} />
                    <EditableText id="stats_fleet_desc" defaultText={t.stats.fleetDesc} isVisualBuilder={isVisualBuilder} as="p" style={{ fontSize: '1rem', color: 'var(--color-text-secondary)', margin: 0, lineHeight: 1.6, position: 'relative', zIndex: 2, maxWidth: '80%' }} />
                  </div>
                  <div style={{ flex: 1, textAlign: 'right' }}>
                    <EditableText id="stats_fleet_val" defaultText={t.stats.fleetValue} isVisualBuilder={isVisualBuilder} as="div" style={{ fontSize: '4.5rem', fontWeight: 800, color: 'var(--color-cyan)', fontFamily: 'var(--font-mono)', lineHeight: 1, textShadow: '0 0 30px rgba(6, 182, 212, 0.5)' }} />
                  </div>
                  <div style={{ position: 'absolute', right: '10%', top: '50%', transform: 'translateY(-50%)', opacity: 0.05 }}><Settings size={200} /></div>
                </div>
              </section>
            </div>
            </div>

            <div className="geological-layer aquifers-layer">
              <div className="geological-layer-content">
                {/* 2.5 About Company Overview */}
                <section className="glow-card-premium" style={{ marginBottom: '60px', display: 'flex', flexDirection: 'column', gap: '20px', padding: '50px', position: 'relative', overflow: 'hidden' }}>
              <div className="bg-glow-orb-1" style={{ position: 'absolute', top: '-100px', right: '-100px', width: '300px', height: '300px', background: 'radial-gradient(circle, var(--color-accent) 0%, transparent 70%)', opacity: 0.05 }}></div>
              <div>
                <EditableText id="about_label" defaultText={t.sections.aboutLabel} isVisualBuilder={isVisualBuilder} className="spec-label" style={{ color: 'var(--color-accent)', fontSize: '1rem' }} />
                <EditableText as="h2" id="about_title" dangerously={true} defaultText={t.sections.aboutTitle} isVisualBuilder={isVisualBuilder} style={{ fontSize: '2.5rem', marginBottom: '20px', lineHeight: 1.2 }} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '40px' }}>
                <div>
                  <EditableText as="p" id="about_p1" dangerously={true} defaultText={t.sections.aboutP1} isVisualBuilder={isVisualBuilder} style={{ color: 'var(--color-text-secondary)', fontSize: '1.05rem', lineHeight: 1.7, marginBottom: '20px' }} />
                  <EditableText as="p" id="about_p2" dangerously={true} defaultText={t.sections.aboutP2} isVisualBuilder={isVisualBuilder} style={{ color: 'var(--color-text-secondary)', fontSize: '1.05rem', lineHeight: 1.7 }} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <div style={{ display: 'flex', gap: '15px', alignItems: 'flex-start' }}>
                    <div style={{ background: 'rgba(6, 182, 212, 0.1)', padding: '12px', borderRadius: '50%', color: 'var(--color-cyan)' }}><ShieldCheck size={24}/></div>
                    <div>
                      <EditableText as="h4" id="about_f1_title" defaultText={t.sections.aboutF1Title} isVisualBuilder={isVisualBuilder} style={{ color: 'var(--color-text-primary)', fontSize: '1.1rem', marginBottom: '5px' }} />
                      <EditableText as="p" id="about_f1_desc" defaultText={t.sections.aboutF1Desc} isVisualBuilder={isVisualBuilder} style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem', lineHeight: 1.5 }} />
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '15px', alignItems: 'flex-start' }}>
                    <div style={{ background: 'rgba(59, 130, 246, 0.1)', padding: '12px', borderRadius: '50%', color: 'var(--color-accent)' }}><Settings size={24}/></div>
                    <div>
                      <EditableText as="h4" id="about_f2_title" defaultText={t.sections.aboutF2Title} isVisualBuilder={isVisualBuilder} style={{ color: 'var(--color-text-primary)', fontSize: '1.1rem', marginBottom: '5px' }} />
                      <EditableText as="p" id="about_f2_desc" defaultText={t.sections.aboutF2Desc} isVisualBuilder={isVisualBuilder} style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem', lineHeight: 1.5 }} />
                    </div>
                  </div>
                </div>
              </div>
            </section>

            
            
            
            
            {/* 2.7 Skewed Glass Accordion Section */}
            <section className="accordion-wrapper">
              <div className="accordion-container">
                
                {/* Block 1: Heavy Equipment */}
                <div className="accordion-item" style={{ cursor: 'pointer' }} onClick={(e) => {
                  if (e.target.isContentEditable || e.target.closest('[contenteditable="true"]')) return;
                  setEquipCategory('rigs');
                  setActivePage('equipment');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}>
                  <div className="accordion-inner">
                    <div className="accordion-bg" style={{ backgroundImage: "url('/images/rig.png')" }}></div>
                    <div className="accordion-overlay"></div>
                    
                    <div className="accordion-title-vertical"><span>Р‘СѓСЂРѕРІР°СЏ С‚РµС…РЅРёРєР°</span></div>
                    
                    <div className="accordion-details">
                      <EditableText id="b1_label" defaultText="РњРђРўР•Р РРђР›Р¬РќРђРЇ Р‘РђР—Рђ" isVisualBuilder={isVisualBuilder} className="spec-label" style={{ color: 'var(--color-cyan)', fontSize: '0.85rem', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '8px', display: 'block' }} />
                      <EditableText as="h3" id="b1_title" defaultText="РњРѕС‰РЅС‹Р№ РїР°СЂРє С‚РµС…РЅРёРєРё" isVisualBuilder={isVisualBuilder} />
                      <EditableText as="p" id="b1_desc" defaultText="РњС‹ РЅРµ Р·Р°РІРёСЃРёРј РѕС‚ Р°СЂРµРЅРґРѕРґР°С‚РµР»РµР№. Р’ РЅР°С€РµРј СЂР°СЃРїРѕСЂСЏР¶РµРЅРёРё РЅР°С…РѕРґСЏС‚СЃСЏ С‚СЏР¶РµР»С‹Рµ СѓСЃС‚Р°РЅРѕРІРєРё РєР»Р°СЃСЃР° Bauer BG20/BG28 РґР»СЏ СѓСЃС‚СЂРѕР№СЃС‚РІР° СЃРІР°Р№ РІ СЃР»РѕР¶РЅРµР№С€РёС… СЃРєР°Р»СЊРЅС‹С… РїРѕСЂРѕРґР°С…, Р° С‚Р°РєР¶Рµ РјР°РЅРµРІСЂРµРЅРЅС‹Рµ РџР‘РЈ-2 РЅР° Р±Р°Р·Рµ РІРµР·РґРµС…РѕРґРЅС‹С… С€Р°СЃСЃРё РЈР РђР›." isVisualBuilder={isVisualBuilder} />
                      <ul>
                        <li><CheckCircle size={18} color="var(--color-cyan)" style={{ marginRight: '10px' }}/> <EditableText id="b1_li1" defaultText="Р‘СѓСЂРµРЅРёРµ РґРѕ 80 РјРµС‚СЂРѕРІ РІ РіР»СѓР±РёРЅСѓ" isVisualBuilder={isVisualBuilder} /></li>
                        <li><CheckCircle size={18} color="var(--color-cyan)" style={{ marginRight: '10px' }}/> <EditableText id="b1_li2" defaultText="Р’С‹РµР·Рґ РЅР° РѕР±СЉРµРєС‚ Р·Р° 24 С‡Р°СЃР° РїРѕ Р Рљ" isVisualBuilder={isVisualBuilder} /></li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Block 2: Laboratory */}
                <div className="accordion-item" style={{ cursor: 'pointer' }} onClick={(e) => {
                  if (e.target.isContentEditable || e.target.closest('[contenteditable="true"]')) return;
                  setEquipCategory('lab');
                  setActivePage('equipment');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}>
                  <div className="accordion-inner">
                    <div className="accordion-bg" style={{ backgroundImage: "url('/images/lab.png')" }}></div>
                    <div className="accordion-overlay"></div>
                    
                    <div className="accordion-title-vertical"><span>Р›Р°Р±РѕСЂР°С‚РѕСЂРёСЏ РіСЂСѓРЅС‚РѕРІ</span></div>
                    
                    <div className="accordion-details">
                      <EditableText id="b2_label" defaultText="РўРћР§РќРћРЎРўР¬ Р”РђРќРќР«РҐ" isVisualBuilder={isVisualBuilder} className="spec-label" style={{ color: 'var(--color-accent)', fontSize: '0.85rem', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '8px', display: 'block' }} />
                      <EditableText as="h3" id="b2_title" defaultText="Р“СЂСѓРЅС‚РѕРІР°СЏ Р»Р°Р±РѕСЂР°С‚РѕСЂРёСЏ" isVisualBuilder={isVisualBuilder} />
                      <EditableText as="p" id="b2_desc" defaultText="РќРё РѕРґРЅР° РїРѕР»РµРІР°СЏ СЂР°Р±РѕС‚Р° РЅРµ РёРјРµРµС‚ СЃРјС‹СЃР»Р° Р±РµР· РєР°С‡РµСЃС‚РІРµРЅРЅС‹С… Р»Р°Р±РѕСЂР°С‚РѕСЂРЅС‹С… С‚РµСЃС‚РѕРІ. РќР°С€ РєРѕРјРїР»РµРєСЃ РѕСЃРЅР°С‰РµРЅ СЃРѕРІСЂРµРјРµРЅРЅС‹РјРё РєРѕРјРїСЂРµСЃСЃРёРѕРЅРЅС‹РјРё Рё СЃРґРІРёРіРѕРІС‹РјРё РїСЂРёР±РѕСЂР°РјРё СЃ Р°РІС‚РѕРјР°С‚РёС‡РµСЃРєРѕР№ С„РёРєСЃР°С†РёРµР№ РґРµС„РѕСЂРјР°С†РёР№." isVisualBuilder={isVisualBuilder} />
                      <ul>
                        <li><CheckCircle size={18} color="var(--color-accent)" style={{ marginRight: '10px' }}/> <EditableText id="b2_li1" defaultText="РђС‚С‚РµСЃС‚Р°С‚ РЎРў Р Рљ РРЎРћ/РњР­Рљ 17025" isVisualBuilder={isVisualBuilder} /></li>
                        <li><CheckCircle size={18} color="var(--color-accent)" style={{ marginRight: '10px' }}/> <EditableText id="b2_li2" defaultText="РҐРёРјРёС‡РµСЃРєРёР№ Р°РЅР°Р»РёР· РІРѕРґС‹ Рё РіСЂСѓРЅС‚РѕРІ" isVisualBuilder={isVisualBuilder} /></li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Block 3: Geodesy */}
                <div className="accordion-item" style={{ cursor: 'pointer' }} onClick={(e) => {
                  if (e.target.isContentEditable || e.target.closest('[contenteditable="true"]')) return;
                  setActivePage('services');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}>
                  <div className="accordion-inner">
                    <div className="accordion-bg" style={{ backgroundImage: "url('/images/geodesy.png')" }}></div>
                    <div className="accordion-overlay"></div>
                    
                    <div className="accordion-title-vertical"><span>РРЅР¶РµРЅРµСЂРЅР°СЏ РіРµРѕРґРµР·РёСЏ</span></div>
                    
                    <div className="accordion-details">
                      <EditableText id="b3_label" defaultText="РРќР–Р•РќР•Р РќРђРЇ Р“Р•РћР”Р•Р—РРЇ" isVisualBuilder={isVisualBuilder} className="spec-label" style={{ color: 'var(--color-cyan)', fontSize: '0.85rem', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '8px', display: 'block' }} />
                      <EditableText as="h3" id="b3_title" defaultText="РўРѕС‡РЅРѕСЃС‚СЊ СЃСЉРµРјРєРё" isVisualBuilder={isVisualBuilder} />
                      <EditableText as="p" id="b3_desc" defaultText="РСЃРїРѕР»СЊР·СѓРµРј СЂРѕР±РѕС‚РёР·РёСЂРѕРІР°РЅРЅС‹Рµ С‚Р°С…РµРѕРјРµС‚СЂС‹ Рё РІС‹СЃРѕРєРѕС‚РѕС‡РЅС‹Рµ GNSS-РїСЂРёРµРјРЅРёРєРё РґР»СЏ СЃРѕР·РґР°РЅРёСЏ РѕРїРѕСЂРЅС‹С… СЃРµС‚РµР№, РјРѕРЅРёС‚РѕСЂРёРЅРіР° РѕСЃР°РґРєРѕРІ С„СѓРЅРґР°РјРµРЅС‚РѕРІ Рё С‚РѕРїРѕРіСЂР°С„РёС‡РµСЃРєРѕР№ СЃСЉРµРјРєРё M1:500 РґР»СЏ СЃР°РјС‹С… СЃР»РѕР¶РЅС‹С… РїСЂРѕРµРєС‚РѕРІ." isVisualBuilder={isVisualBuilder} />
                      <ul>
                        <li><CheckCircle size={18} color="var(--color-cyan)" style={{ marginRight: '10px' }}/> <EditableText id="b3_li1" defaultText="3D-РјРѕРґРµР»РёСЂРѕРІР°РЅРёРµ СЂРµР»СЊРµС„Р°" isVisualBuilder={isVisualBuilder} /></li>
                        <li><CheckCircle size={18} color="var(--color-cyan)" style={{ marginRight: '10px' }}/> <EditableText id="b3_li2" defaultText="Р’С‹РЅРѕСЃ РѕСЃРµР№ Р·РґР°РЅРёР№ РІ РЅР°С‚СѓСЂСѓ" isVisualBuilder={isVisualBuilder} /></li>
                      </ul>
                    </div>
                  </div>
                </div>

              </div>
            </section>

            {/* 3. Services Section (Photo Cards) */}
            <section style={{ marginBottom: '50px' }}>
              <div style={{ textAlign: 'center', marginBottom: '30px' }}>
                <EditableText id="services_label_v3" defaultText={t.sections.servicesLabel} isVisualBuilder={isVisualBuilder} className="hero-subtitle" />
                <EditableText as="h2" id="services_title_v3" defaultText={t.sections.servicesTitle} isVisualBuilder={isVisualBuilder} />
              </div>
              
<div className="service-bento-grid">
  {/* 1. Geology - Wide */}
  <div className="service-bento-card wide" onClick={() => {setActiveServiceTab('geology'); setActivePage('services');}}>
    <div className="service-bento-bg">
      <img src={adminData.services.find(s => s.id === 'geology')?.image || "/images/services/geology.jpg"} onError={(e) => { e.target.src='/images/hero.png'; e.target.style.filter='brightness(0.7)'; }} style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center right' }} alt="Service" />
    </div><div className="service-bento-overlay"></div>
    <div className="service-bento-content">
      <h3 className="service-bento-title">РРЅР¶РµРЅРµСЂРЅРѕ-РіРµРѕР»РѕРіРёС‡РµСЃРєРёРµ РёР·С‹СЃРєР°РЅРёСЏ</h3>
      <ul className="service-bento-list">
        <li>Р‘СѓСЂРµРЅРёРµ РёР·С‹СЃРєР°С‚РµР»СЊСЃРєРёС… СЃРєРІР°Р¶РёРЅ</li>
        <li>РћС‚Р±РѕСЂ РјРѕРЅРѕР»РёС‚РѕРІ Рё РїСЂРѕР± РІРѕРґ</li>
        <li>РћРїРёСЃР°РЅРёРµ РіСЂСѓРЅС‚РѕРІРѕРіРѕ РјР°СЃСЃРёРІР°</li>
        <li>РР·СѓС‡РµРЅРёРµ РѕРїР°СЃРЅС‹С… РїСЂРѕС†РµСЃСЃРѕРІ</li>
      </ul>
    </div>

    <div className="service-bento-arrow">
      <svg viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: '100%', height: '100%' }}>
        <circle cx="50" cy="50" r="45" strokeDasharray="5 5" />
        <path d="M30 70 L70 30" strokeWidth="4" />
        <path d="M50 30 L70 30 L70 50" strokeWidth="4" />
      </svg>
    </div>
  </div>

  {/* 2. Geodesy - Normal */}
  <div className="service-bento-card" onClick={() => {setActiveServiceTab('geodesy'); setActivePage('services');}}>
    <div className="service-bento-bg">
      <img src={adminData.services.find(s => s.id === 'geodesy')?.image || "/images/services/geodesy.jpg"} onError={(e) => { e.target.src='/images/hero.png'; e.target.style.filter='brightness(0.7)'; }} style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center right' }} alt="Service" />
    </div><div className="service-bento-overlay"></div>
    <div className="service-bento-content">
      <h3 className="service-bento-title">Р“РµРѕРґРµР·РёСЏ Рё С‚РѕРїРѕСЃСЉРµРјРєР°</h3>
      <ul className="service-bento-list">
        <li>РўРѕРїРѕСЃСЉРµРјРєР° РјР°СЃС€С‚Р°Р±РѕРІ 1:500</li>
        <li>РЎСЉРµРјРєР° РєРѕРјРјСѓРЅРёРєР°С†РёР№</li>
        <li>Р’С‹РЅРѕСЃ РѕСЃРµР№ РІ РЅР°С‚СѓСЂСѓ</li>
      </ul>
    </div>

    <div className="service-bento-arrow">
      <svg viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: '100%', height: '100%' }}>
        <circle cx="50" cy="50" r="45" strokeDasharray="5 5" />
        <path d="M30 70 L70 30" strokeWidth="4" />
        <path d="M50 30 L70 30 L70 50" strokeWidth="4" />
      </svg>
    </div>
  </div>

  {/* 3. CPT - Normal */}
  <div className="service-bento-card" onClick={() => {setActiveServiceTab('cpt'); setActivePage('services');}}>
    <div className="service-bento-bg">
      <img src={adminData.services.find(s => s.id === 'cpt')?.image || "/images/services/cpt.jpg"} onError={(e) => { e.target.src='/images/hero.png'; e.target.style.filter='brightness(0.7)'; }} style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center right' }} alt="Service" />
    </div><div className="service-bento-overlay"></div>
    <div className="service-bento-content">
      <h3 className="service-bento-title">CPT Р—РѕРЅРґРёСЂРѕРІР°РЅРёРµ</h3>
      <ul className="service-bento-list">
        <li>Р’РґР°РІР»РёРІР°РЅРёРµ РєРѕРЅСѓСЃР°</li>
        <li>РР·РјРµСЂРµРЅРёРµ СЃРѕРїСЂРѕС‚РёРІР»РµРЅРёСЏ</li>
        <li>Р Р°СЃС‡Р»РµРЅРµРЅРёРµ СЂР°Р·СЂРµР·Р°</li>
      </ul>
    </div>

    <div className="service-bento-arrow">
      <svg viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: '100%', height: '100%' }}>
        <circle cx="50" cy="50" r="45" strokeDasharray="5 5" />
        <path d="M30 70 L70 30" strokeWidth="4" />
        <path d="M50 30 L70 30 L70 50" strokeWidth="4" />
      </svg>
    </div>
  </div>

  {/* 4. Piles - Normal */}
  <div className="service-bento-card" onClick={() => {setActiveServiceTab('piles'); setActivePage('services');}}>
    <div className="service-bento-bg">
      <img src={adminData.services.find(s => s.id === 'piles')?.image || "/images/services/piles.jpg"} onError={(e) => { e.target.src='/images/hero.png'; e.target.style.filter='brightness(0.7)'; }} style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center right' }} alt="Service" />
    </div><div className="service-bento-overlay"></div>
    <div className="service-bento-content">
      <h3 className="service-bento-title">РСЃРїС‹С‚Р°РЅРёСЏ СЃРІР°Р№</h3>
      <ul className="service-bento-list">
        <li>РЎС‚Р°С‚РёС‡РµСЃРєР°СЏ РЅР°РіСЂСѓР·РєР°</li>
        <li>Р’С‹РґРµСЂРіРёРІР°СЋС‰Р°СЏ РЅР°РіСЂСѓР·РєР°</li>
        <li>Р”РёРЅР°РјРёС‡РµСЃРєРёРµ РёСЃРїС‹С‚Р°РЅРёСЏ</li>
      </ul>
    </div>

    <div className="service-bento-arrow">
      <svg viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: '100%', height: '100%' }}>
        <circle cx="50" cy="50" r="45" strokeDasharray="5 5" />
        <path d="M30 70 L70 30" strokeWidth="4" />
        <path d="M50 30 L70 30 L70 50" strokeWidth="4" />
      </svg>
    </div>
  </div>

  {/* 5. Plates - Normal */}
  <div className="service-bento-card" onClick={() => {setActiveServiceTab('plates'); setActivePage('services');}}>
    <div className="service-bento-bg">
      <img src={adminData.services.find(s => s.id === 'plates')?.image || "/images/services/plates.jpg"} onError={(e) => { e.target.src='/images/hero.png'; e.target.style.filter='brightness(0.7)'; }} style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center right' }} alt="Service" />
    </div><div className="service-bento-overlay"></div>
    <div className="service-bento-content">
      <h3 className="service-bento-title">РЁС‚Р°РјРїРѕРІС‹Рµ РёСЃРїС‹С‚Р°РЅРёСЏ</h3>
      <ul className="service-bento-list">
        <li>РџР»РѕСЃРєРёРµ РєСЂСѓРіР»С‹Рµ С€С‚Р°РјРїС‹</li>
        <li>РСЃРїС‹С‚Р°РЅРёСЏ РІ СЃРєРІР°Р¶РёРЅР°С…</li>
        <li>РњРѕРґСѓР»СЊ РґРµС„РѕСЂРјР°С†РёРё</li>
      </ul>
    </div>

    <div className="service-bento-arrow">
      <svg viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: '100%', height: '100%' }}>
        <circle cx="50" cy="50" r="45" strokeDasharray="5 5" />
        <path d="M30 70 L70 30" strokeWidth="4" />
        <path d="M50 30 L70 30 L70 50" strokeWidth="4" />
      </svg>
    </div>
  </div>

  {/* 6. Laboratory - Full Width */}
  <div className="service-bento-card full" onClick={() => {setActiveServiceTab('laboratory'); setActivePage('services');}}>
    <div className="service-bento-bg">
      <img src={adminData.services.find(s => s.id === 'laboratory')?.image || "/images/services/laboratory.jpg"} onError={(e) => { e.target.src='/images/hero.png'; e.target.style.filter='brightness(0.7)'; }} style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center right' }} alt="Service" />
    </div><div className="service-bento-overlay"></div>
    <div className="service-bento-content">
      <h3 className="service-bento-title">Р›Р°Р±РѕСЂР°С‚РѕСЂРёСЏ РіСЂСѓРЅС‚РѕРІ</h3>
      <ul className="service-bento-list">
        <li>Р¤РёР·РёРєРѕ-РјРµС…Р°РЅРёС‡РµСЃРєРёРµ СЃРІРѕР№СЃС‚РІР°</li>
        <li>РҐРёРјРёС‡РµСЃРєРёР№ Р°РЅР°Р»РёР· РІРѕРґС‹</li>
        <li>РљРѕСЂСЂРѕР·РёРѕРЅРЅР°СЏ Р°РіСЂРµСЃСЃРёРІРЅРѕСЃС‚СЊ</li>
        <li>РљРѕРјРїСЂРµСЃСЃРёРѕРЅРЅРѕРµ СЃР¶Р°С‚РёРµ</li>
      </ul>
    </div>

    <div className="service-bento-arrow">
      <svg viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: '100%', height: '100%' }}>
        <circle cx="50" cy="50" r="45" strokeDasharray="5 5" />
        <path d="M30 70 L70 30" strokeWidth="4" />
        <path d="M50 30 L70 30 L70 50" strokeWidth="4" />
      </svg>
    </div>
  </div>
</div>
            </section>
            </div>
            </div>
            <div className="geological-layer mantle-layer">
              <div className="geological-layer-content">
                
                
                
                {/* 4. Projects Section (Clean Split Layout) */}
                <section style={{ marginBottom: '80px', position: 'relative', zIndex: 10 }}>
              
              {/* Header Above Everything */}
              <div style={{ textAlign: 'center', marginBottom: '40px', background: theme === 'dark' ? 'var(--bg-dark)' : 'rgba(255,255,255,0.95)', padding: '40px 20px', borderRadius: '30px', border: theme === 'dark' ? '1px solid rgba(255,255,255,0.05)' : '1px solid rgba(0,0,0,0.05)', boxShadow: theme === 'dark' ? '0 20px 50px rgba(0,0,0,0.3)' : '0 10px 30px rgba(0,0,0,0.05)' }} className="map-header-card">
                <EditableText id="portfolio_label_v3" defaultText="РџРћР РўР¤РћР›РРћ" isVisualBuilder={isVisualBuilder} className="spec-label" style={{ color: 'var(--color-cyan)', fontSize: '1rem', letterSpacing: '4px', textTransform: 'uppercase', marginBottom: '15px', display: 'block' }} />
                <EditableText as="h2" id="portfolio_title_v3" defaultText="Р’С‹РїРѕР»РЅРµРЅРЅС‹Рµ РћР±СЉРµРєС‚С‹" isVisualBuilder={isVisualBuilder} style={{ fontSize: '2.8rem', fontWeight: 800, lineHeight: 1.2, margin: '0 0 25px 0', color: 'var(--color-text-primary)', maxWidth: '800px', marginLeft: 'auto', marginRight: 'auto' }} />
                
                <a href="#portfolio" onClick={(e) => { e.preventDefault(); setActivePage('portfolio'); }} className="cta-button-primary glow-effect" style={{ padding: '15px 40px', fontSize: '1.1rem', borderRadius: '30px', display: 'inline-block' }}>
                  <EditableText id="portfolio_btn_v3" defaultText="РЎРјРѕС‚СЂРµС‚СЊ РІСЃРµ 50+ РїСЂРѕРµРєС‚РѕРІ" isVisualBuilder={isVisualBuilder} />
                </a>
              </div>

              {/* Split View: Map Left, List Right */}
              <div style={{ display: 'flex', flexDirection: 'row', gap: '30px', alignItems: 'stretch' }} className="portfolio-split-view">
                
                {/* Map Area (Left) */}
                <div style={{ flex: '1 1 65%', height: '600px', borderRadius: '24px', overflow: 'hidden', border: '1px solid rgba(6, 182, 212, 0.3)', boxShadow: '0 30px 60px rgba(0,0,0,0.5)', position: 'relative' }}>
                  <MapContainer center={[48.0196, 66.9237]} zoom={5} scrollWheelZoom={false} style={{ height: '100%', width: '100%', background: theme !== 'dark' ? '#f8fafc' : '#030509', zIndex: 1 }}>
                    <TileLayer key={theme} 
                      url={theme !== 'dark' ? "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" : "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"} 
                      attribution="&copy; OpenStreetMap &copy; CARTO" 
                    />
                    <MapFlyTo center={activeProjectCoords || [48.0196, 66.9237]} zoom={activeMapZoom} />
                    
                    {kzGeoJson && (
                      <GeoJSON 
                        data={kzGeoJson} 
                        style={{ 
                          color: 'var(--color-cyan)', 
                          weight: 3, 
                          fillColor: 'var(--color-cyan)', 
                          fillOpacity: theme === 'dark' ? 0.05 : 0.08,
                          dashArray: '6, 8'
                        }} 
                      />
                    )}

                    {currentProjects.map(proj => (
                      <Marker 
                        key={proj.id}
                        ref={(ref) => {
                          if (ref) markerRefs.current[proj.id] = ref;
                        }} 
                        position={proj.coords} 
                        icon={customGlowIcon}
                        eventHandlers={{
                          click: () => {
                            setActiveProjectCoords(proj.coords);
                            setActiveMapZoom(13);
                          }
                        }}
                      >
                        <Tooltip direction="top" offset={[0, -10]} opacity={1} className="hud-tooltip">
                          <strong style={{ color: 'var(--color-accent)' }}>{proj.client}</strong><br/>
                          {proj.name}
                        </Tooltip>
                        <Popup>
                          <strong style={{ color: 'var(--color-accent)', fontSize: '0.9rem' }}>{proj.client}</strong><br/>
                          <span style={{ fontWeight: 600, fontSize: '0.95rem' }}>{proj.name}</span><br/>
                          <span style={{ fontSize: '0.8rem', color: '#aaa' }}>{proj.loc}</span><br/>
                          <span style={{ fontSize: '0.85rem', color: 'var(--color-cyan)', marginTop: '5px', display: 'block' }}>{proj.type}</span>
                        </Popup>
                      </Marker>
                    ))}
                  </MapContainer>
                  
                  {activeProjectCoords && (
                    <button 
                      onClick={() => { setActiveProjectCoords(null); setActiveMapZoom(5); }}
                      style={{ position: 'absolute', bottom: '25px', left: '25px', zIndex: 1000, padding: '12px 24px', background: 'rgba(10, 15, 25, 0.8)', backdropFilter: 'blur(10px)', border: '1px solid var(--color-cyan)', color: 'white', borderRadius: '30px', cursor: 'pointer', fontSize: '0.95rem', fontWeight: 600, boxShadow: '0 10px 20px rgba(0,0,0,0.3)' }}
                    >
                      <MapPin size={18} style={{ display: 'inline', marginRight: '8px', verticalAlign: 'text-bottom' }} />
                      Р’РµСЂРЅСѓС‚СЊСЃСЏ Рє РѕР±Р·РѕСЂСѓ Р Рљ
                    </button>
                  )}
                </div>

                {/* Projects List Area (Right) */}
                <div style={{ flex: '1 1 35%', display: 'flex', flexDirection: 'column', gap: '15px', height: '600px', overflowY: 'auto', padding: '25px', background: theme === 'dark' ? 'var(--bg-dark)' : 'rgba(255,255,255,0.95)', borderRadius: '24px', border: theme === 'dark' ? '1px solid rgba(255,255,255,0.05)' : '1px solid rgba(0,0,0,0.05)', boxShadow: theme === 'dark' ? '0 20px 50px rgba(0,0,0,0.3)' : '0 10px 30px rgba(0,0,0,0.05)' }} className="projects-list-scroll">
                  {filteredProjects.map(proj => {
                    const isActive = activeProjectCoords === proj.coords;
                    return (
                      <div 
                        key={proj.id} 
                        style={{
                          position: 'relative',
                          padding: '15px 25px',
                          cursor: 'pointer',
                          transition: 'all 0.3s ease',
                          opacity: 1,
                          background: isActive ? (theme === 'dark' ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)') : 'transparent',
                          borderLeft: isActive ? '3px solid var(--color-cyan)' : '3px solid transparent',
                          borderRadius: '16px'
                        }}
                        onClick={() => {
                          setActiveProjectCoords(proj.coords);
                          setActiveMapZoom(13);
                          setTimeout(() => {
                            const marker = markerRefs.current[proj.id];
                            if (marker) marker.openPopup();
                          }, 1500); // Wait for flyTo animation to finish
                        }}
                      >
                        {/* Decorative Background Bubble (РџСѓР·С‹СЂСЊ) */}
                        <div style={{ position: 'absolute', top: '10px', left: '15px', width: '45px', height: '45px', borderRadius: '50%', backgroundColor: 'var(--color-cyan)', opacity: theme === 'dark' ? 0.15 : 0.25, zIndex: 0, transition: 'all 0.3s ease', transform: isActive ? 'scale(1.1)' : 'scale(1)' }}></div>
                        
                        <div style={{ position: 'relative', zIndex: 1, fontSize: '0.85rem', color: 'var(--color-accent)', fontWeight: 800, letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '4px' }}>
                          {proj.client}
                        </div>
                        <div style={{ position: 'relative', zIndex: 1, fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-text-primary)', marginBottom: '10px' }}>
                          {proj.name}
                        </div>
                        <div style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.95rem', color: 'var(--color-text-secondary)', marginTop: '4px' }}>
                          <MapPin size={16} color="var(--color-cyan)" /> {proj.loc}
                        </div>
                        <div style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.95rem', color: 'var(--color-text-secondary)', marginTop: '4px' }}>
                          <Settings size={16} color="var(--color-cyan)" /> {proj.type}
                        </div>
                      </div>
                    );
                  })}
                </div>

              </div>
            </section>

            {/* 4.5. Approach Section (New) */}
            <section style={{ marginBottom: '80px', position: 'relative' }}>
              <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                <EditableText id="approach_label_v3" defaultText="РРќР”РР’РР”РЈРђР›Р¬РќР«Р™ РџРћР”РҐРћР”" isVisualBuilder={isVisualBuilder} className="hero-subtitle" style={{ color: 'var(--color-accent)', textShadow: '0 0 15px rgba(59, 130, 246, 0.6)' }} />
                <EditableText as="h2" id="approach_title_v3" defaultText={t.sections.approachTitle} isVisualBuilder={isVisualBuilder} style={{ fontSize: '2.5rem', marginBottom: '20px', textShadow: '0 0 40px rgba(255,255,255,0.2)', maxWidth: '900px', margin: '0 auto 20px auto' }} />
                <EditableText as="p" id="approach_desc" defaultText={t.sections.approachDesc} isVisualBuilder={isVisualBuilder} style={{ color: 'var(--color-text-secondary)', fontSize: '1.05rem', lineHeight: 1.6, maxWidth: '800px', margin: '0 auto' }} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '30px', position: 'relative', zIndex: 2, alignItems: 'stretch' }}>
                {/* Card 1 */}
                <div className="approach-card-premium">
                  <div className="approach-watermark">01</div>
                  <div className="license-icon-glow" style={{ marginBottom: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '80px', height: '80px', background: 'rgba(6, 182, 212, 0.1)', borderRadius: '50%', border: '1px solid rgba(6, 182, 212, 0.3)', boxShadow: '0 0 20px rgba(6, 182, 212, 0.2)' }}>
                    <Search size={36} color="var(--color-cyan)" />
                  </div>
                  <EditableText as="h3" id="app_c1_t" defaultText={t.sections.approach1Title} isVisualBuilder={isVisualBuilder} style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '20px', color: 'var(--color-text-primary)', lineHeight: 1.4 }} />
                  <EditableText as="p" id="app_c1_d" defaultText={t.sections.approach1Text} isVisualBuilder={isVisualBuilder} style={{ color: 'var(--color-text-secondary)', fontSize: '1rem', lineHeight: 1.6, flex: 1 }} />
                </div>

                {/* Card 2 */}
                <div className="approach-card-premium approach-card-center">
                  <div className="approach-watermark">02</div>
                  <div className="license-icon-glow" style={{ marginBottom: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '80px', height: '80px', background: 'rgba(59, 130, 246, 0.1)', borderRadius: '50%', border: '1px solid rgba(59, 130, 246, 0.3)', boxShadow: '0 0 20px rgba(59, 130, 246, 0.2)' }}>
                    <Briefcase size={36} color="var(--color-accent)" />
                  </div>
                  <EditableText as="h3" id="app_c2_t" defaultText={t.sections.approach2Title} isVisualBuilder={isVisualBuilder} style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '20px', color: 'var(--color-text-primary)', lineHeight: 1.4 }} />
                  <ul style={{ color: 'var(--color-text-secondary)', fontSize: '1rem', lineHeight: 1.6, paddingLeft: '20px', margin: 0, flex: 1 }}>
                    <EditableText as="li" id="app_c2_l1" dangerously={true} defaultText={t.sections.approach2L1} isVisualBuilder={isVisualBuilder} style={{ marginBottom: '12px' }} />
                    <EditableText as="li" id="app_c2_l2" dangerously={true} defaultText={t.sections.approach2L2} isVisualBuilder={isVisualBuilder} style={{ marginBottom: '12px' }} />
                    <EditableText as="li" id="app_c2_l3" dangerously={true} defaultText={t.sections.approach2L3} isVisualBuilder={isVisualBuilder} style={{ marginBottom: '12px' }} />
                    <EditableText as="li" id="app_c2_l4" dangerously={true} defaultText={t.sections.approach2L4} isVisualBuilder={isVisualBuilder} />
                  </ul>
                </div>

                {/* Card 3 */}
                <div className="approach-card-premium">
                  <div className="approach-watermark">03</div>
                  <div className="license-icon-glow" style={{ marginBottom: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '80px', height: '80px', background: 'rgba(6, 182, 212, 0.1)', borderRadius: '50%', border: '1px solid rgba(6, 182, 212, 0.3)', boxShadow: '0 0 20px rgba(6, 182, 212, 0.2)' }}>
                    <ShieldCheck size={36} color="var(--color-cyan)" />
                  </div>
                  <EditableText as="h3" id="app_c3_t" defaultText={t.sections.approach3Title} isVisualBuilder={isVisualBuilder} style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '20px', color: 'var(--color-text-primary)', lineHeight: 1.4 }} />
                  <EditableText as="p" id="app_c3_d" defaultText={t.sections.approach3Text} isVisualBuilder={isVisualBuilder} style={{ color: 'var(--color-text-secondary)', fontSize: '1rem', lineHeight: 1.6, marginBottom: '20px' }} />
                  <ul style={{ color: 'var(--color-text-secondary)', fontSize: '1rem', lineHeight: 1.6, paddingLeft: '20px', margin: 0, flex: 1 }}>
                    <EditableText as="li" id="app_c3_l1" dangerously={true} defaultText={t.sections.approach3L1} isVisualBuilder={isVisualBuilder} style={{ marginBottom: '12px' }} />
                    <EditableText as="li" id="app_c3_l2" dangerously={true} defaultText={t.sections.approach3L2} isVisualBuilder={isVisualBuilder} style={{ marginBottom: '12px' }} />
                    <EditableText as="li" id="app_c3_l3" dangerously={true} defaultText={t.sections.approach3L3} isVisualBuilder={isVisualBuilder} />
                  </ul>
                </div>
              </div>

              <div style={{ textAlign: 'center', marginTop: '50px', position: 'relative', zIndex: 2 }}>
                <button className="btn btn-primary" style={{ padding: '15px 45px', fontSize: '1.1rem', boxShadow: '0 0 30px rgba(6, 182, 212, 0.4)' }} onClick={() => setActivePage('calculator')}>{t.sections.approachBtn}</button>
              </div>

              {/* Watermark Logo */}
              <img src="/images/logo.png" alt="Stamp Watermark" style={{ position: 'absolute', bottom: '-10%', right: '-5%', transform: 'rotate(-15deg)', width: '600px', opacity: 0.03, pointerEvents: 'none', filter: 'grayscale(100%) blur(2px)' }} />
            </section>

            {/* 5. Director / About Section */}
            <section style={{ marginBottom: '80px', position: 'relative' }}>
              <div style={{ textAlign: 'center', marginBottom: '40px', position: 'relative', zIndex: 2 }}>
                <EditableText id="founder_label_v3" defaultText="Р РЈРљРћР’РћР”РЎРўР’Рћ РљРћРњРџРђРќРР" isVisualBuilder={isVisualBuilder} className="hero-subtitle" style={{ color: 'var(--color-cyan)', textShadow: '0 0 15px rgba(6, 182, 212, 0.6)' }} />
                <EditableText as="h2" id="founder_title_v3" defaultText="РЎР»РѕРІРѕ РћСЃРЅРѕРІР°С‚РµР»СЏ" isVisualBuilder={isVisualBuilder} style={{ fontSize: '3.2rem', textShadow: '0 0 40px rgba(255,255,255,0.2)' }} />
              </div>
              <div className="bg-glow-orb-2" style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '600px', height: '600px', background: 'radial-gradient(circle, var(--color-cyan) 0%, transparent 70%)', opacity: 0.05 }}></div>
              <div className="glow-card-premium" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '0', alignItems: 'stretch', padding: '0', overflow: 'hidden', position: 'relative', zIndex: 2, background: 'var(--bg-card)', border: '1px solid var(--border-color)', boxShadow: '0 0 50px rgba(0,0,0,0.1)' }}>
                <div style={{ position: 'relative', minHeight: '500px', overflow: 'hidden' }}>
                  <img src={adminData.media?.directorImage || ((adminData.team || []).find(m => (m.name && m.name.toLowerCase().includes('С€РµРЅРІРёР·РѕРІ')) || (m.badge && m.badge.toLowerCase().includes('РѕСЃРЅРѕРІР°С‚РµР»СЊ'))) || adminData.team?.[0])?.img || '/images/director.png'} alt="Р“РµРЅРµСЂР°Р»СЊРЅС‹Р№ РґРёСЂРµРєС‚РѕСЂ" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center top', filter: 'contrast(1.1)' }} />
                  {isVisualBuilder && (
                    <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10 }}>
                      <label style={{ background: 'var(--color-cyan)', color: '#000', padding: '12px 24px', borderRadius: '30px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', gap: '8px', alignItems: 'center', boxShadow: '0 4px 20px rgba(6, 182, 212, 0.6)' }}>
                        <Camera size={20} /> РР·РјРµРЅРёС‚СЊ С„РѕС‚Рѕ
                        <input 
                          type="file" 
                          accept="image/*" 
                          style={{ display: 'none' }} 
                          onChange={(e) => {
                            const file = e.target.files[0];
                            if (file) {
                                const img = new window.Image();
                                img.onload = () => {
                                  const canvas = document.createElement('canvas');
                                  let width = img.width;
                                  let height = img.height;
                                  const maxDim = 1200;
                                  if (width > maxDim || height > maxDim) {
                                    if (width > height) {
                                      height = Math.round((height * maxDim) / width);
                                      width = maxDim;
                                    } else {
                                      width = Math.round((width * maxDim) / height);
                                      height = maxDim;
                                    }
                                  }
                                  canvas.width = width;
                                  canvas.height = height;
                                  const ctx = canvas.getContext('2d');
                                  ctx.drawImage(img, 0, 0, width, height);
                                  const compressed = canvas.toDataURL('image/jpeg', 0.82);
                                  
                                  fetch(compressed).then(res => res.blob()).then(blob => {
                                    uploadFileToServer(new File([blob], file.name, { type: 'image/jpeg' })).then(url => {
                                      if (url) {
                                        setAdminData(prev => {
                                          const newTeam = [...(prev.team || [])];
                                          if (newTeam[0]) newTeam[0] = { ...newTeam[0], img: url };
                                          return {
                                            ...prev,
                                            media: { ...(prev.media || {}), directorImage: url },
                                            team: newTeam
                                          };
                                        });
                                      }
                                    });
                                  });
                                };
                                img.src = URL.createObjectURL(file);
                            }
                          }}
                        />
                      </label>
                    </div>
                  )}
                  <div style={{ position: 'absolute', bottom: '-50px', left: '-50px', width: '200px', height: '200px', background: 'var(--color-cyan)', filter: 'blur(100px)', opacity: 0.15, zIndex: 0 }}></div>
                </div>
                
                <div style={{ padding: '60px', display: 'flex', flexDirection: 'column', justifyContent: 'center', position: 'relative' }}>
                  <div style={{ position: 'absolute', top: '-10px', left: '20px', fontSize: '15rem', color: 'var(--color-cyan)', opacity: 0.05, fontFamily: 'Georgia, serif', lineHeight: 1, pointerEvents: 'none' }}>вЂњ</div>
                  
                  <div style={{ position: 'relative', zIndex: 2 }}>
                    <EditableText as="h3" id="f_name" defaultText="Р•СЃРµРЅС‚Р°РµРІ РђСЃРєР°СЂ" isVisualBuilder={isVisualBuilder} style={{ fontSize: '2.8rem', marginBottom: '5px', color: 'var(--color-text-primary)', letterSpacing: '-0.02em' }} />
                    <EditableText as="h3" id="f_patr" defaultText="РЈР°Р»РёРµРІРёС‡" isVisualBuilder={isVisualBuilder} style={{ fontSize: '2.2rem', marginBottom: '25px', color: 'var(--color-text-secondary)', fontWeight: 400 }} />
                    
                    <EditableText as="div" id="f_role" defaultText="Р”РёСЂРµРєС‚РѕСЂ" isVisualBuilder={isVisualBuilder} style={{ display: 'inline-block', padding: '8px 16px', background: 'rgba(6, 182, 212, 0.1)', border: '1px solid rgba(6, 182, 212, 0.3)', borderRadius: '20px', color: 'var(--color-cyan)', fontSize: '0.85rem', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '35px', fontWeight: 600 }} />
                    
                    <EditableText as="p" id="f_quote" defaultText="РњС‹ СЃС‚СЂРѕРёРј РЅР°С€Сѓ СЂР°Р±РѕС‚Сѓ РЅР° Р±РµР·СѓРїСЂРµС‡РЅРѕР№ С‚РѕС‡РЅРѕСЃС‚Рё Рё СЃС‚СЂРѕРіРѕРј СЃРѕРѕС‚РІРµС‚СЃС‚РІРёРё СЂРµРіР»Р°РјРµРЅС‚Р°Рј РЎРџ Р Рљ Рё Р“РћРЎРў. РЎ 2019 РіРѕРґР° РЅР°С€Р° РєРѕРјР°РЅРґР° РѕРїС‹С‚РЅС‹С… Р±СѓСЂРѕРІС‹С… РёРЅР¶РµРЅРµСЂРѕРІ, РіРµРѕРґРµР·РёСЃС‚РѕРІ Рё Р»Р°Р±РѕСЂР°РЅС‚РѕРІ СѓСЃРїРµС€РЅРѕ СЂРµР°Р»РёР·СѓРµС‚ СЃР»РѕР¶РЅРµР№С€РёРµ РїСЂРѕРµРєС‚С‹ РїРѕ РІСЃРµРјСѓ РљР°Р·Р°С…СЃС‚Р°РЅСѓ, РѕР±РµСЃРїРµС‡РёРІР°СЏ РїСЂРѕС‡РЅС‹Р№ С„СѓРЅРґР°РјРµРЅС‚ РґР»СЏ РєР°Р¶РґРѕРіРѕ РѕР±СЉРµРєС‚Р°." isVisualBuilder={isVisualBuilder} style={{ color: 'var(--color-text-secondary)', fontSize: '1.15rem', lineHeight: 1.8, marginBottom: '40px', fontStyle: 'italic', borderLeft: '3px solid var(--color-cyan)', paddingLeft: '25px', position: 'relative' }} />
                    
                    <div>
                      <button className="btn btn-primary" onClick={() => setActivePage('about')} style={{ padding: '16px 40px', fontSize: '1.1rem', boxShadow: '0 10px 25px rgba(6, 182, 212, 0.2)' }}>
                        РџРѕРґСЂРѕР±РЅРµРµ Рѕ РєРѕРјРїР°РЅРёРё
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* 7. Licenses Overview */}
            <section style={{ marginBottom: '50px', position: 'relative' }}>
              <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                <EditableText id="lic_label" defaultText="РћР¤РР¦РРђР›Р¬РќР«Р™ РЎРўРђРўРЈРЎ" isVisualBuilder={isVisualBuilder} className="hero-subtitle" style={{ color: 'var(--color-cyan)', textShadow: '0 0 15px rgba(6, 182, 212, 0.6)' }} />
                <EditableText as="h2" id="lic_title" defaultText={t.sections.licensesTitle} isVisualBuilder={isVisualBuilder} style={{ fontSize: '3.2rem', textShadow: '0 0 40px rgba(255,255,255,0.2)' }} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '30px', position: 'relative', zIndex: 2 }}>
                {(adminData.dynamicLists?.['about_documents'] || DOCUMENTS_DATA).slice(0, 3).map((doc, idx) => { doc.id = doc.id || idx; return (
                  <div key={doc.id || Math.random()} className="glow-card-premium" style={{ padding: '40px 30px', textAlign: 'center', position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    
                    {/* Background faint huge icon */}
                    <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', opacity: 0.03, pointerEvents: 'none' }}>
                      {doc.id === 'lic-gsl' && <ShieldCheck size={250} />}
                      {doc.id === 'accreditation' && <Award size={250} />}
                      {doc.id.startsWith('iso') && <FileText size={250} />}
                    </div>
                    
                    {/* Glowing front icon */}
                    <div style={{ background: doc.id === 'lic-gsl' ? 'rgba(239, 68, 68, 0.1)' : doc.id === 'accreditation' ? 'rgba(6, 182, 212, 0.1)' : 'rgba(59, 130, 246, 0.1)', padding: '20px', borderRadius: '50%', marginBottom: '25px', display: 'inline-flex', position: 'relative', zIndex: 2 }}>
                      {doc.id === 'lic-gsl' && <ShieldCheck size={40} color="#ef4444" />}
                      {doc.id === 'accreditation' && <Award size={40} color="var(--color-cyan)" />}
                      {doc.id.startsWith('iso') && <FileText size={40} color="var(--color-accent)" />}
                    </div>
                    
                    <h3 style={{ fontSize: '1.3rem', marginBottom: '15px', color: 'var(--color-text-primary)', fontWeight: 800, position: 'relative', zIndex: 2, lineHeight: 1.4 }}>{doc.title}</h3>
                    <span className="spec-label" style={{ color: doc.id === 'lic-gsl' ? '#ef4444' : doc.id === 'accreditation' ? 'var(--color-cyan)' : 'var(--color-accent)', fontSize: '0.9rem', letterSpacing: '0.15em', textShadow: `0 0 10px ${doc.id === 'lic-gsl' ? 'rgba(239, 68, 68, 0.4)' : doc.id === 'accreditation' ? 'rgba(6, 182, 212, 0.4)' : 'rgba(59, 130, 246, 0.4)'}`, position: 'relative', zIndex: 2 }}>{doc.subtitle}</span>
                  </div>
                ); })}
              </div>
              <div style={{ textAlign: 'center', marginTop: '50px', position: 'relative', zIndex: 2 }}>
                <button className="btn btn-primary" style={{ padding: '15px 45px', fontSize: '1.1rem', boxShadow: '0 0 30px rgba(6, 182, 212, 0.4)' }} onClick={() => setActivePage('documents')}>Р’СЃРµ РґРѕРєСѓРјРµРЅС‚С‹ РїР»Р°С‚С„РѕСЂРјС‹</button>
              </div>
            </section>

            {/* 8. Call to Action / Lead Form */}
            <section style={{ marginBottom: '50px', background: 'var(--bg-card)', padding: '60px 40px', borderRadius: 'var(--border-radius-lg)', border: '1px solid var(--border-color)', boxShadow: '0 0 50px rgba(6, 182, 212, 0.15)', position: 'relative', overflow: 'hidden' }}>
              <div className="bg-glow-orb-2" style={{ position: 'absolute', top: '50%', left: '0', transform: 'translate(-50%, -50%)', width: '400px', height: '400px', background: 'radial-gradient(circle, var(--color-cyan) 0%, transparent 70%)', opacity: 0.1 }}></div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '50px', position: 'relative', zIndex: 2, alignItems: 'center' }}>
                <div>
                  <EditableText id="form_label" defaultText="Р“РћРўРћР’Р« РќРђР§РђРўР¬?" isVisualBuilder={isVisualBuilder} className="spec-label" style={{ color: 'var(--color-cyan)', fontSize: '1rem' }} />
                  <EditableText as="h2" id="form_title" dangerously={true} defaultText="РћСЃС‚Р°РІСЊС‚Рµ Р·Р°СЏРІРєСѓ РЅР°<br/><span style='color: var(--color-accent)'>СЂР°СЃС‡РµС‚ СЃС‚РѕРёРјРѕСЃС‚Рё</span>" isVisualBuilder={isVisualBuilder} style={{ fontSize: '2.5rem', marginBottom: '20px', lineHeight: 1.2 }} />
                  <EditableText as="p" id="form_desc" defaultText="РќР°С€Рё РёРЅР¶РµРЅРµСЂС‹ СЃРІСЏР¶СѓС‚СЃСЏ СЃ РІР°РјРё РІ С‚РµС‡РµРЅРёРµ 15 РјРёРЅСѓС‚, РёР·СѓС‡Р°С‚ РёСЃС…РѕРґРЅС‹Рµ РґР°РЅРЅС‹Рµ Рё РїСЂРµРґРѕСЃС‚Р°РІСЏС‚ РїСЂРѕР·СЂР°С‡РЅСѓСЋ СЃРјРµС‚Сѓ СЃС‚СЂРѕРіРѕ РїРѕ СЃР±РѕСЂРЅРёРєСѓ С†РµРЅ." isVisualBuilder={isVisualBuilder} style={{ color: 'var(--color-text-secondary)', fontSize: '1.1rem', lineHeight: 1.6, marginBottom: '30px' }} />
                  
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                        <div style={{ background: 'rgba(255,255,255,0.05)', padding: '10px', borderRadius: '50%' }}><Phone size={20} color="var(--color-cyan)"/></div>
                        <span style={{ fontSize: '1.1rem', fontWeight: 600 }}>
                          <EditableText id="cta_phone_val" defaultText={adminData.global?.phone || '+7 705 969 0101'} isVisualBuilder={isVisualBuilder} />
                        </span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                        <div style={{ background: 'rgba(255,255,255,0.05)', padding: '10px', borderRadius: '50%' }}><MapPin size={20} color="var(--color-cyan)"/></div>
                        <span style={{ fontSize: '1.1rem', fontWeight: 600 }}>
                          <EditableText id="cta_address_val" defaultText={adminData.global?.address || 'Рі. РђР»РјР°С‚С‹, РїСЂ-С‚ РђР±Р°СЏ, 150'} isVisualBuilder={isVisualBuilder} />
                        </span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                        <div style={{ background: 'rgba(255,255,255,0.05)', padding: '10px', borderRadius: '50%' }}><Mail size={20} color="var(--color-cyan)"/></div>
                        <span style={{ fontSize: '1.1rem', fontWeight: 600 }}>
                          <EditableText id="cta_email_val" defaultText={adminData.global?.email || 'info@spengeo.kz'} isVisualBuilder={isVisualBuilder} />
                        </span>
                      </div>
                    </div>
                </div>

                <div style={{ background: 'var(--bg-dark-secondary)', padding: '40px', borderRadius: 'var(--border-radius-md)', border: '1px solid var(--border-color)', backdropFilter: 'blur(10px)' }}>
                  <form onSubmit={(e) => {
                    handleInquirySubmit(e);
                    alert('Р—Р°СЏРІРєР° СѓСЃРїРµС€РЅРѕ РѕС‚РїСЂР°РІР»РµРЅР°! РРЅР¶РµРЅРµСЂ СЃРІСЏР¶РµС‚СЃСЏ СЃ РІР°РјРё РІ С‚РµС‡РµРЅРёРµ 15 РјРёРЅСѓС‚.');
                  }}>
                    <div style={{ marginBottom: '20px' }}>
                      <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--color-text-secondary)', marginBottom: '8px', letterSpacing: '0.05em' }}>Р’РђРЁР• РРњРЇ</label>
                      <input type="text" value={inquiryName} onChange={(e) => setInquiryName(e.target.value)} placeholder="РљР°Рє Рє РІР°Рј РѕР±СЂР°С‰Р°С‚СЊСЃСЏ?" className="glass-input" style={{ width: '100%', padding: '15px', background: 'var(--bg-dark)', border: '1px solid var(--border-color)', borderRadius: 'var(--border-radius-sm)', color: 'var(--color-text-primary)', fontSize: '1rem', outline: 'none', transition: 'border-color 0.3s' }} onFocus={(e) => e.target.style.borderColor = 'var(--color-cyan)'} onBlur={(e) => e.target.style.borderColor = 'var(--border-color)'} required />
                    </div>
                    <div style={{ marginBottom: '20px' }}>
                      <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--color-text-secondary)', marginBottom: '8px', letterSpacing: '0.05em' }}>РќРћРњР•Р  РўР•Р›Р•Р¤РћРќРђ</label>
                      <input type="tel" value={inquiryPhone} onChange={(e) => setInquiryPhone(e.target.value)} placeholder="+7 (___) ___-__-__" className="glass-input" style={{ width: '100%', padding: '15px', background: 'var(--bg-dark)', border: '1px solid var(--border-color)', borderRadius: 'var(--border-radius-sm)', color: 'var(--color-text-primary)', fontSize: '1rem', outline: 'none', transition: 'border-color 0.3s' }} onFocus={(e) => e.target.style.borderColor = 'var(--color-cyan)'} onBlur={(e) => e.target.style.borderColor = 'var(--border-color)'} required />
                    </div>
                    <div style={{ marginBottom: '30px' }}>
                      <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--color-text-secondary)', marginBottom: '8px', letterSpacing: '0.05em' }}>Р’РР” РР—Р«РЎРљРђРќРР™</label>
                      <select value={inquiryType} onChange={(e) => setInquiryType(e.target.value)} className="glass-input" style={{ width: '100%', padding: '15px', background: 'var(--bg-dark)', border: '1px solid var(--border-color)', borderRadius: 'var(--border-radius-sm)', color: 'var(--color-text-primary)', fontSize: '1rem', outline: 'none', appearance: 'none', cursor: 'pointer' }}>
                        <option value="both" style={{ background: 'var(--bg-card)' }}>РљРѕРјРїР»РµРєСЃРЅС‹Рµ РёР·С‹СЃРєР°РЅРёСЏ</option>
                        <option value="geology" style={{ background: 'var(--bg-card)' }}>РРЅР¶РµРЅРµСЂРЅР°СЏ РіРµРѕР»РѕРіРёСЏ</option>
                        <option value="geodesy" style={{ background: 'var(--bg-card)' }}>Р“РµРѕРґРµР·РёСЏ Рё С‚РѕРїРѕСЃСЉРµРјРєР°</option>
                      </select>
                    </div>
                    <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '15px', fontSize: '1.1rem', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px' }}>
                      РћС‚РїСЂР°РІРёС‚СЊ Р·Р°СЏРІРєСѓ <Send size={18}/>
                    </button>
                  </form>
                </div>
              </div>
            </section>
            </div>
            </div>
          </div>
        )}

        {/* ==================== PAGE: ABOUT ==================== */}
        {activePage === 'about' && (
          <div className="page-wrapper page-enter">
            <div key={activeSubPage || 'main'} style={{ marginBottom: '50px' }}>
              <EditableText
                as="h2"
                id={`about_title_${activeSubPage || 'main'}`}
                isVisualBuilder={isVisualBuilder}
                defaultText={
                  activeSubPage === 'history' ? 'РСЃС‚РѕСЂРёСЏ РєРѕРјРїР°РЅРёРё' : 
                  activeSubPage === 'team' ? 'РќР°С€Р° РєРѕРјР°РЅРґР°' : 
                  activeSubPage === 'advantages' ? 'РќР°С€Рё РїСЂРµРёРјСѓС‰РµСЃС‚РІР°' :
                  'Рћ РєРѕРјРїР°РЅРёРё РўРћРћ В«РЎРїРµС†РРЅР¶Р“РµРѕВ»'
                }
              />
              <EditableText
                as="p"
                id={`about_desc_${activeSubPage || 'main'}`}
                isVisualBuilder={isVisualBuilder}
                style={{ color: 'var(--color-text-secondary)' }}
                defaultText={
                  activeSubPage === 'history' ? 'РџСѓС‚СЊ СЂР°Р·РІРёС‚РёСЏ РЅР°С€РµР№ РєРѕРјРїР°РЅРёРё СЃ 2019 РіРѕРґР° РґРѕ СЃРµРіРѕРґРЅСЏС€РЅРµРіРѕ РґРЅСЏ.' : 
                  activeSubPage === 'team' ? 'РџРѕР·РЅР°РєРѕРјСЊС‚РµСЃСЊ СЃ РЅР°С€РёРјРё РІРµРґСѓС‰РёРјРё РёРЅР¶РµРЅРµСЂР°РјРё Рё СЃРїРµС†РёР°Р»РёСЃС‚Р°РјРё.' : 
                  activeSubPage === 'advantages' ? 'РЈР·РЅР°Р№С‚Рµ, РїРѕС‡РµРјСѓ РЅР°Рј РґРѕРІРµСЂСЏСЋС‚ РєСЂСѓРїРЅРµР№С€РёРµ СЃС‚СЂРѕРёС‚РµР»СЊРЅС‹Рµ РєРѕРјРїР°РЅРёРё.' :
                  'РљРѕРјРїР»РµРєСЃРЅС‹Рµ РёРЅР¶РµРЅРµСЂРЅС‹Рµ РёР·С‹СЃРєР°РЅРёСЏ РґР»СЏ РїСЂРѕРјС‹С€Р»РµРЅРЅРѕРіРѕ Рё РіСЂР°Р¶РґР°РЅСЃРєРѕРіРѕ СЃС‚СЂРѕРёС‚РµР»СЊСЃС‚РІР° СЃ 2019 РіРѕРґР°.'
                }
              />
            </div>

            {(!activeSubPage || activeSubPage === 'history') && (
              <>
              <div className="glow-card-premium" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '0', alignItems: 'stretch', padding: '0', overflow: 'hidden', position: 'relative', zIndex: 2, background: 'var(--bg-card)', border: '1px solid var(--border-color)', boxShadow: '0 0 50px rgba(0,0,0,0.1)', marginBottom: '60px' }}>
                  <div style={{ position: 'relative', minHeight: '500px', overflow: 'hidden' }}>
                    <img src={adminData.media?.historyDirectorImage || '/images/director.png'} alt="Р СѓРєРѕРІРѕРґРёС‚РµР»СЊ" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center top', filter: 'contrast(1.1)' }} />
                    {isVisualBuilder && (
                      <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10 }}>
                        <label style={{ background: 'var(--color-cyan)', color: '#000', padding: '12px 24px', borderRadius: '30px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', gap: '8px', alignItems: 'center', boxShadow: '0 4px 20px rgba(6, 182, 212, 0.6)' }}>
                          <Camera size={20} /> РР·РјРµРЅРёС‚СЊ С„РѕС‚Рѕ
                          <input 
                            type="file" 
                            accept="image/*" 
                            style={{ display: 'none' }} 
                            onChange={(e) => {
                              const file = e.target.files[0];
                              if (file) {
                                const reader = new FileReader();
                                reader.onload = (ev) => {
                                  const img = new window.Image();
                                  img.onload = () => {
                                    const canvas = document.createElement('canvas');
                                    let width = img.width;
                                    let height = img.height;
                                    const maxDim = 1200;
                                    if (width > maxDim || height > maxDim) {
                                      if (width > height) {
                                        height = Math.round((height * maxDim) / width);
                                        width = maxDim;
                                      } else {
                                        width = Math.round((width * maxDim) / height);
                                        height = maxDim;
                                      }
                                    }
                                    canvas.width = width;
                                    canvas.height = height;
                                    const ctx = canvas.getContext('2d');
                                    ctx.drawImage(img, 0, 0, width, height);
                                    const compressed = canvas.toDataURL('image/jpeg', 0.82);
                                    
                                    fetch(compressed).then(res => res.blob()).then(blob => {
                                      uploadFileToServer(new File([blob], file.name, { type: 'image/jpeg' })).then(url => {
                                        if (url) {
                                          setAdminData(prev => ({
                                            ...prev,
                                            media: { ...(prev.media || {}), historyDirectorImage: url }
                                          }));
                                        }
                                      });
                                    });
                                  };
                                  img.src = ev.target.result;
                                };
                                reader.readAsDataURL(file);
                              }
                            }}
                          />
                        </label>
                      </div>
                    )}
                    <div style={{ position: 'absolute', bottom: '-50px', left: '-50px', width: '200px', height: '200px', background: 'var(--color-cyan)', filter: 'blur(100px)', opacity: 0.15, zIndex: 0 }}></div>
                  </div>
                  
                  <div style={{ padding: '60px', display: 'flex', flexDirection: 'column', justifyContent: 'center', position: 'relative' }}>
                    <div style={{ position: 'absolute', top: '-10px', left: '20px', fontSize: '15rem', color: 'var(--color-cyan)', opacity: 0.05, fontFamily: 'Georgia, serif', lineHeight: 1, pointerEvents: 'none' }}>вЂњ</div>
                    
                    <div style={{ position: 'relative', zIndex: 2 }}>
                      <EditableText as="h3" id="history_f_name" defaultText="Р•СЃРµРЅС‚Р°РµРІ РђСЃРєР°СЂ" isVisualBuilder={isVisualBuilder} style={{ fontSize: '2.8rem', marginBottom: '5px', color: 'var(--color-text-primary)', letterSpacing: '-0.02em' }} />
                      <EditableText as="h3" id="history_f_patr" defaultText="РЈР°Р»РёРµРІРёС‡" isVisualBuilder={isVisualBuilder} style={{ fontSize: '2.2rem', marginBottom: '25px', color: 'var(--color-text-secondary)', fontWeight: 400 }} />
                      
                      <EditableText as="div" id="history_f_role" defaultText="Р”РѕРєС‚РѕСЂ PhD РІ РѕР±Р»Р°СЃС‚Рё &quot;РЎС‚СЂРѕРёС‚РµР»СЊСЃС‚РІРѕ&quot;" isVisualBuilder={isVisualBuilder} style={{ display: 'inline-block', padding: '8px 16px', background: 'rgba(6, 182, 212, 0.1)', border: '1px solid rgba(6, 182, 212, 0.3)', borderRadius: '20px', color: 'var(--color-cyan)', fontSize: '0.85rem', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '35px', fontWeight: 600 }} />
                      
                      <EditableText as="p" id="history_f_quote" dangerously={true} defaultText="РђСЃРєР°СЂ РЈР°Р»РёРµРІРёС‡ вЂ” РґРёСЂРµРєС‚РѕСЂ РўРћРћ В«РЎРїРµС†РРЅР¶Р“РµРѕВ», РґРѕРєС‚РѕСЂ С„РёР»РѕСЃРѕС„РёРё (PhD) РІ РѕР±Р»Р°СЃС‚Рё СЃС‚СЂРѕРёС‚РµР»СЊСЃС‚РІР° Рё РіРµРѕС‚РµС…РЅРёРєРё. РЎРїРµС†РёР°Р»РёР·РёСЂСѓРµС‚СЃСЏ РЅР° РёРЅР¶РµРЅРµСЂРЅРѕ-РіРµРѕР»РѕРіРёС‡РµСЃРєРёС… РёР·С‹СЃРєР°РЅРёСЏС…, РіРµРѕС‚РµС…РЅРёС‡РµСЃРєРѕРј СЃРѕРїСЂРѕРІРѕР¶РґРµРЅРёРё СЃС‚СЂРѕРёС‚РµР»СЊСЃС‚РІР°, РїСЂРѕРµРєС‚РёСЂРѕРІР°РЅРёРё РѕСЃРЅРѕРІР°РЅРёР№ Рё С„СѓРЅРґР°РјРµРЅС‚РѕРІ, Р° С‚Р°РєР¶Рµ РІРЅРµРґСЂРµРЅРёРё СЃРѕРІСЂРµРјРµРЅРЅС‹С… С‚РµС…РЅРѕР»РѕРіРёР№ РёСЃСЃР»РµРґРѕРІР°РЅРёСЏ РіСЂСѓРЅС‚РѕРІ.<br/><br/>РџРѕРґ РµРіРѕ СЂСѓРєРѕРІРѕРґСЃС‚РІРѕРј РєРѕРјРїР°РЅРёСЏ СѓСЃРїРµС€РЅРѕ СЂРµР°Р»РёР·СѓРµС‚ РїСЂРѕРµРєС‚С‹ РїСЂРѕРјС‹С€Р»РµРЅРЅРѕРіРѕ, РіСЂР°Р¶РґР°РЅСЃРєРѕРіРѕ Рё РёРЅС„СЂР°СЃС‚СЂСѓРєС‚СѓСЂРЅРѕРіРѕ СЃС‚СЂРѕРёС‚РµР»СЊСЃС‚РІР° РїРѕ РІСЃРµР№ С‚РµСЂСЂРёС‚РѕСЂРёРё РљР°Р·Р°С…СЃС‚Р°РЅР°. РћСЃРѕР±РѕРµ РІРЅРёРјР°РЅРёРµ СѓРґРµР»СЏРµС‚СЃСЏ РєР°С‡РµСЃС‚РІСѓ РІС‹РїРѕР»РЅСЏРµРјС‹С… РёРЅР¶РµРЅРµСЂРЅС‹С… РёР·С‹СЃРєР°РЅРёР№, РїСЂРёРјРµРЅРµРЅРёСЋ СЃРѕРІСЂРµРјРµРЅРЅРѕРіРѕ РѕР±РѕСЂСѓРґРѕРІР°РЅРёСЏ, СЃРѕР±Р»СЋРґРµРЅРёСЋ С‚СЂРµР±РѕРІР°РЅРёР№ РЎРџ Р Рљ, Р“РћРЎРў Рё РјРµР¶РґСѓРЅР°СЂРѕРґРЅС‹С… СЃС‚Р°РЅРґР°СЂС‚РѕРІ, Р° С‚Р°РєР¶Рµ РїРѕРёСЃРєСѓ СЌС„С„РµРєС‚РёРІРЅС‹С… РёРЅР¶РµРЅРµСЂРЅС‹С… СЂРµС€РµРЅРёР№ РґР»СЏ РєР°Р¶РґРѕРіРѕ РѕР±СЉРµРєС‚Р°.<br/><br/>РћСЃРЅРѕРІРЅРѕР№ РїСЂРёРЅС†РёРї СЂР°Р±РѕС‚С‹ вЂ” РїСЂРѕС„РµСЃСЃРёРѕРЅР°Р»РёР·Рј, РёРЅР¶РµРЅРµСЂРЅР°СЏ С‚РѕС‡РЅРѕСЃС‚СЊ Рё РѕС‚РІРµС‚СЃС‚РІРµРЅРЅРѕСЃС‚СЊ РїРµСЂРµРґ Р·Р°РєР°Р·С‡РёРєРѕРј. Р‘Р»Р°РіРѕРґР°СЂСЏ СЃРѕС‡РµС‚Р°РЅРёСЋ РЅР°СѓС‡РЅРѕРіРѕ РїРѕРґС…РѕРґР°, РїСЂР°РєС‚РёС‡РµСЃРєРѕРіРѕ РѕРїС‹С‚Р° Рё СЃРѕРІСЂРµРјРµРЅРЅС‹С… С‚РµС…РЅРѕР»РѕРіРёР№ РўРћРћ В«РЎРїРµС†РРЅР¶Р“РµРѕВ» РѕР±РµСЃРїРµС‡РёРІР°РµС‚ РІС‹СЃРѕРєРѕРµ РєР°С‡РµСЃС‚РІРѕ РІС‹РїРѕР»РЅСЏРµРјС‹С… СЂР°Р±РѕС‚, Р° С‚РµС…РЅРёС‡РµСЃРєР°СЏ РґРѕРєСѓРјРµРЅС‚Р°С†РёСЏ РєРѕРјРїР°РЅРёРё СѓСЃРїРµС€РЅРѕ РїСЂРѕС…РѕРґРёС‚ РіРѕСЃСѓРґР°СЂСЃС‚РІРµРЅРЅСѓСЋ Рё РІРµРґРѕРјСЃС‚РІРµРЅРЅСѓСЋ СЌРєСЃРїРµСЂС‚РёР·Сѓ." isVisualBuilder={isVisualBuilder} style={{ color: 'var(--color-text-secondary)', fontSize: '1.1rem', lineHeight: 1.8, position: 'relative', zIndex: 2, fontStyle: 'italic', borderLeft: '3px solid var(--color-cyan)', paddingLeft: '25px' }} />
                    </div>
                  </div>
                </div>
                
                {/* Timeline */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginTop: '40px', marginBottom: '60px' }}>
                  {(adminData.dynamicLists?.['about_history'] || DEFAULT_HISTORY).map((hist, i) => (
                    <HudCard key={i} style={{ padding: '25px', borderLeft: '4px solid var(--color-cyan)' }}>
                      <EditableText as="h3" id={`hist_title_${i}`} defaultText={hist.title} isVisualBuilder={isVisualBuilder} style={{ fontSize: '2rem', color: 'var(--color-text-primary)', marginBottom: '10px' }} />
                      <EditableText as="p" id={`hist_desc_${i}`} defaultText={hist.desc} isVisualBuilder={isVisualBuilder} style={{ fontSize: '0.95rem', color: 'var(--color-text-secondary)', lineHeight: 1.6 }} />
                    </HudCard>
                  ))}
                </div>
              </>
            )}

            {activeSubPage === 'team' && (
              <div style={{ marginBottom: '60px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '40px' }}>
                  {(adminData.team || []).map((member, i) => (
                    <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                      <div style={{ position: 'relative', height: '400px', borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--color-border)', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}>
                        <div className="hud-bracket hud-bracket-tl"></div><div className="hud-bracket hud-bracket-tr"></div><div className="hud-bracket hud-bracket-bl"></div><div className="hud-bracket hud-bracket-br"></div>
                        <img src={member.img || member.image || '/images/director.png'} alt={member.name} style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center top' }} />
                        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '100px', background: 'linear-gradient(to top, var(--color-bg) 0%, transparent 100%)' }}></div>
                      </div>
                      <div>
                        <div style={{ display: 'inline-block', padding: '6px 12px', background: 'var(--color-card-bg)', border: '1px solid var(--color-cyan)', color: 'var(--color-cyan)', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 'bold', marginBottom: '15px', letterSpacing: '0.1em' }}>
                          {member.badge || 'РЎРџР•Р¦РРђР›РРЎРў'}
                        </div>
                        <h3 style={{ fontSize: '2.2rem', marginBottom: '5px', color: 'var(--color-text-primary)', letterSpacing: '-0.02em' }}>{member.name}</h3>
                        <div style={{ fontSize: '1.1rem', color: 'var(--color-accent)', marginBottom: '20px', fontWeight: '500' }}>
                          {member.role || member.position}
                        </div>
                        <p style={{ color: 'var(--color-text-secondary)', fontSize: '1.05rem', lineHeight: 1.8, borderLeft: '3px solid var(--color-cyan)', paddingLeft: '20px', fontStyle: 'italic' }}>
                          {member.desc}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {(!activeSubPage || activeSubPage === 'advantages') && (
            <section style={{ marginBottom: '40px' }}>
              <h3 style={{ marginBottom: '20px' }}>РќР°С€Рё С†РµРЅРЅРѕСЃС‚Рё Рё РїСЂРёРЅС†РёРїС‹</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
                <HudCard style={{ padding: '25px' }}>
                  <h4 style={{ color: 'var(--color-accent)', marginBottom: '10px' }}>РўРѕС‡РЅРѕСЃС‚СЊ</h4>
                  <p style={{ fontSize: '0.88rem', color: 'var(--color-text-secondary)' }}>РЎРѕРІСЂРµРјРµРЅРЅРѕРµ СЃРµСЂС‚РёС„РёС†РёСЂРѕРІР°РЅРЅРѕРµ РѕР±РѕСЂСѓРґРѕРІР°РЅРёРµ РіР°СЂР°РЅС‚РёСЂСѓРµС‚ 100% РґРѕСЃС‚РѕРІРµСЂРЅРѕСЃС‚СЊ РґР°РЅРЅС‹С… РіСЂСѓРЅС‚РѕРІ.</p>
                </HudCard>
                <HudCard style={{ padding: '25px' }}>
                  <h4 style={{ color: 'var(--color-cyan)', marginBottom: '10px' }}>РћРїРµСЂР°С‚РёРІРЅРѕСЃС‚СЊ</h4>
                  <p style={{ fontSize: '0.88rem', color: 'var(--color-text-secondary)' }}>РЎРѕР±СЃС‚РІРµРЅРЅС‹Рµ Р±СѓСЂРѕРІС‹Рµ СѓСЃС‚Р°РЅРѕРІРєРё РЈР РђР›/РљРђРњРђР— РїРѕР·РІРѕР»СЏСЋС‚ РІС‹РµР·Р¶Р°С‚СЊ РЅР° РѕР±СЉРµРєС‚ РІ С‚РµС‡РµРЅРёРµ 24 С‡Р°СЃРѕРІ.</p>
                </HudCard>
                <HudCard style={{ padding: '25px' }}>
                  <h4 style={{ color: 'var(--color-accent)', marginBottom: '10px' }}>РЎРѕРїСЂРѕРІРѕР¶РґРµРЅРёРµ</h4>
                  <p style={{ fontSize: '0.88rem', color: 'var(--color-text-secondary)' }}>Р—Р°С‰РёС‰Р°РµРј РѕС‚С‡РµС‚С‹ РІ Р“РѕСЃСЌРєСЃРїРµСЂС‚РёР·Рµ Р Рљ РґРѕ РїРѕР»СѓС‡РµРЅРёСЏ РїРѕР»РѕР¶РёС‚РµР»СЊРЅРѕРіРѕ Р·Р°РєР»СЋС‡РµРЅРёСЏ.</p>
                </HudCard>
              </div>
            </section>
            )}

            {activeSubPage && activeSubPage !== 'history' && activeSubPage !== 'team' && activeSubPage !== 'advantages' && adminData.dynamicLists?.['about_' + activeSubPage] && adminData.dynamicLists['about_' + activeSubPage].length > 0 && (() => {
              const currentSubMenu = dynamicMenu['ru'].find(m => m.page === 'about')?.items?.find(sub => sub.action.subpage === activeSubPage);
              const isDoc = currentSubMenu && (currentSubMenu.name.toLowerCase().includes('Р»РёС†РµРЅР·') || currentSubMenu.name.toLowerCase().includes('СЃРµСЂС‚РёС„РёРєР°С‚') || currentSubMenu.name.toLowerCase().includes('РґРѕРєСѓРјРµРЅС‚'));
              
              if (isDoc) {
                return (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '30px', marginBottom: '60px' }}>
                    {adminData.dynamicLists['about_' + activeSubPage].map((doc, idx) => (
                      <HudCard key={doc.id || idx} style={{ padding: '30px', textAlign: 'center' }}>
                        <div style={{ fontSize: '3rem', marginBottom: '20px' }}>
                          {doc.title?.toLowerCase().includes('Р»РёС†РµРЅР·') ? 'рџ›ЎпёЏ' : doc.title?.toLowerCase().includes('Р°РєРєСЂРµРґ') ? 'рџ”¬' : 'рџ“њ'}
                        </div>
                        <h3 style={{ fontSize: '1.25rem', marginBottom: '8px', color: 'var(--color-text-primary)' }}>{doc.title}</h3>
                        {doc.desc && <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', marginBottom: '20px' }}>{doc.desc}</p>}
                        <button className="btn btn-secondary" onClick={() => setCertModal({ title: doc.title, text: doc.desc || '', image: doc.image })} style={{ padding: '8px 16px', fontSize: '0.8rem', width: '100%' }}>
                          РџСЂРѕСЃРјРѕС‚СЂРµС‚СЊ РґРѕРєСѓРјРµРЅС‚
                        </button>
                      </HudCard>
                    ))}
                  </div>
                );
              }
              
              return (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '30px', marginBottom: '60px' }}>
                  {adminData.dynamicLists['about_' + activeSubPage].map((item, idx) => (
                    <HudCard key={item.id || idx} style={{ padding: '0', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                       {item.image && (
                           <div style={{ width: '100%', height: '220px', overflow: 'hidden', background: 'rgba(0,0,0,0.2)' }}>
                              <img src={item.image} alt={item.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                           </div>
                       )}
                       <div style={{ padding: '25px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                           {item.title && <h3 style={{ margin: 0, fontSize: '1.25rem', color: 'var(--color-text-primary)' }}>{item.title}</h3>}
                           {item.coeff && <span style={{ display: 'inline-block', padding: '4px 8px', background: 'rgba(6, 182, 212, 0.1)', color: 'var(--color-cyan)', borderRadius: '4px', fontSize: '0.85rem', width: 'fit-content' }}>{item.coeff}</span>}
                           {item.desc && <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--color-text-secondary)', lineHeight: '1.6', whiteSpace: 'pre-wrap' }}>{item.desc}</p>}
                       </div>
                    </HudCard>
                  ))}
                </div>
              );
            })()}
          </div>
        )}
        {/* END SERVICES */}

        {/* ==================== PAGE: SERVICES ==================== */}
        {activePage === 'services' && (
          <div className="page-wrapper page-enter">
            <div style={{ marginBottom: '50px' }}>
              <EditableText as="h2" id="services_title" defaultText="РРЅР¶РµРЅРµСЂРЅС‹Рµ РЈСЃР»СѓРіРё" isVisualBuilder={isVisualBuilder} />
              <EditableText as="p" id="services_desc" defaultText="Р›РёС†РµРЅР·РёСЂРѕРІР°РЅРЅС‹Рµ РёР·С‹СЃРєР°РЅРёСЏ В«РїРѕРґ РєР»СЋС‡В» РїРѕ РІСЃРµР№ С‚РµСЂСЂРёС‚РѕСЂРёРё Р Рљ." isVisualBuilder={isVisualBuilder} style={{ color: 'var(--color-text-secondary)' }} />
            </div>

            <div className="equip-grid" style={{ marginBottom: '50px' }}>
              <div className="equip-list">
                {adminData.services.map((item, index) => {
                  const key = item.id || `service-${index}`;
                  const Icon = SERVICES_DATA[key]?.icon || ChevronRight;
                  return (
                    <button
                      key={key}
                      type="button"
                      className={`equip-item-btn ${activeServiceTab === key ? 'active' : ''}`}
                      onClick={() => setActiveServiceTab(key)}
                    >
                      <span style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <Icon size={16} />
                        {item.title}
                      </span>
                      <ChevronRight size={14} />
                    </button>
                  );
                })}
              </div>

              {/* Sub-item detailed specs */}
              <div key={activeServiceTab} className="cad-container" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div className="cad-crosshairs"></div>
                {(() => {
                  const currentService = adminData.services.find((s, idx) => (s.id || `service-${idx}`) === activeServiceTab) || adminData.services[0];
                  return (
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                        <span className="hero-subtitle" style={{ fontSize: '0.72rem', color: 'var(--color-accent-secondary)', margin: 0 }}>
                          РЈРЎР›РЈР“Рђ // <EditableText id={`service_code_${activeServiceTab || '0'}`} defaultText={currentService.code} isVisualBuilder={isVisualBuilder} />
                        </span>
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--color-accent)' }}>
                          РЎРўРђРќР”РђР Рў: <EditableText id={`service_reg_${activeServiceTab || '0'}`} defaultText={currentService.reg} isVisualBuilder={isVisualBuilder} />
                        </span>
                      </div>
                      
                      <EditableText as="h3" id={`service_title_${activeServiceTab || '0'}`} defaultText={currentService.title} isVisualBuilder={isVisualBuilder} style={{ fontSize: '1.8rem', color: 'var(--color-text-primary)', marginBottom: '20px' }} />

                      {currentService.image && (
                        <div className="service-img-wrapper" style={{ marginTop: '20px', marginBottom: '20px' }}>
                          <img src={currentService.image} alt={activeServiceTab} style={{ width: '100%', borderRadius: '8px', maxHeight: '300px', objectFit: 'cover' }} />
                          <div className="service-img-overlay"></div>
                        </div>
                      )}
                      
                      <EditableText as="p" id={`service_desc_${activeServiceTab || '0'}`} defaultText={currentService.desc} isVisualBuilder={isVisualBuilder} style={{ color: 'var(--color-text-secondary)', fontSize: '1.05rem', lineHeight: '1.7', marginBottom: '30px' }} />
                    </div>
                  );
                })()}

                <div style={{ borderTop: '1px dashed rgba(255,255,255,0.1)', paddingTop: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)' }}>
                    &gt; РР—Р«РЎРљРђРќРРЇ Р’Р•Р”РЈРўРЎРЇ РЎРўР РћР“Рћ РџРћ РЎРџ Р Рљ
                  </span>
                  <button className="btn btn-primary" onClick={() => setActivePage('calculator')} style={{ padding: '8px 16px', fontSize: '0.8rem' }}>
                    Р Р°СЃСЃС‡РёС‚Р°С‚СЊ СЃРјРµС‚Сѓ
                  </button>
                </div>
              </div>
            </div>

            {/* Life cycle flowchart */}
            <HudCard style={{ marginBottom: '40px' }}>
              <EditableText as="h3" id="services_lifecycle" defaultText="рџљЂ Р–РёР·РЅРµРЅРЅС‹Р№ С†РёРєР» РёРЅР¶РµРЅРµСЂРЅС‹С… РёР·С‹СЃРєР°РЅРёР№" isVisualBuilder={isVisualBuilder} style={{ marginBottom: '30px', fontFamily: 'var(--font-display)', fontSize: '1.3rem' }} />
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '20px', position: 'relative' }}>
                <div style={{ textAlign: 'center', padding: '20px', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '8px', backgroundColor: 'rgba(0,0,0,0.2)' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'var(--color-accent-glow)', border: '2px solid var(--color-accent)', display: 'flex', justifyContent: 'center', alignItems: 'center', margin: '0 auto 12px', fontWeight: 'bold' }}>1</div>
                  <EditableText as="h4" id="lifecycle_t1" defaultText="РўРµС…Р·Р°РґР°РЅРёРµ" isVisualBuilder={isVisualBuilder} style={{ fontSize: '0.9rem', marginBottom: '5px' }} />
                  <EditableText as="p" id="lifecycle_d1" defaultText="РЎРѕРіР»Р°СЃРѕРІР°РЅРёРµ РўР— Рё СЂР°СЃС‡РµС‚ РіР»СѓР±РёРЅС‹" isVisualBuilder={isVisualBuilder} style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }} />
                </div>
                <div style={{ textAlign: 'center', padding: '20px', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '8px', backgroundColor: 'rgba(0,0,0,0.2)' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'var(--color-cyan-glow)', border: '2px solid var(--color-cyan)', display: 'flex', justifyContent: 'center', alignItems: 'center', margin: '0 auto 12px', fontWeight: 'bold' }}>2</div>
                  <EditableText as="h4" id="lifecycle_t2" defaultText="РџРѕР»РµРІРѕР№ СЌС‚Р°Рї" isVisualBuilder={isVisualBuilder} style={{ fontSize: '0.9rem', marginBottom: '5px' }} />
                  <EditableText as="p" id="lifecycle_d2" defaultText="РњРѕР±РёР»РёР·Р°С†РёСЏ С‚РµС…РЅРёРєРё, Р±СѓСЂРµРЅРёРµ СЃРєРІР°Р¶РёРЅ" isVisualBuilder={isVisualBuilder} style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }} />
                </div>
                <div style={{ textAlign: 'center', padding: '20px', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '8px', backgroundColor: 'rgba(0,0,0,0.2)' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'var(--color-accent-glow)', border: '2px solid var(--color-accent)', display: 'flex', justifyContent: 'center', alignItems: 'center', margin: '0 auto 12px', fontWeight: 'bold' }}>3</div>
                  <EditableText as="h4" id="lifecycle_t3" defaultText="Р›Р°Р±РѕСЂР°С‚РѕСЂРёСЏ" isVisualBuilder={isVisualBuilder} style={{ fontSize: '0.9rem', marginBottom: '5px' }} />
                  <EditableText as="p" id="lifecycle_d3" defaultText="РђРЅР°Р»РёР· РїСЂРѕС‡РЅРѕСЃС‚Рё РіСЂСѓРЅС‚РѕРІ" isVisualBuilder={isVisualBuilder} style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }} />
                </div>
                <div style={{ textAlign: 'center', padding: '20px', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '8px', backgroundColor: 'rgba(0,0,0,0.2)' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'var(--color-cyan-glow)', border: '2px solid var(--color-cyan)', display: 'flex', justifyContent: 'center', alignItems: 'center', margin: '0 auto 12px', fontWeight: 'bold' }}>4</div>
                  <EditableText as="h4" id="lifecycle_t4" defaultText="РљР°РјРµСЂР°Р»РєР°" isVisualBuilder={isVisualBuilder} style={{ fontSize: '0.9rem', marginBottom: '5px' }} />
                  <EditableText as="p" id="lifecycle_d4" defaultText="РЎРѕСЃС‚Р°РІР»РµРЅРёРµ РѕС‚С‡РµС‚Р° Рё 3D-СЂР°Р·СЂРµР·РѕРІ" isVisualBuilder={isVisualBuilder} style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }} />
                </div>
                <div style={{ textAlign: 'center', padding: '20px', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '8px', backgroundColor: 'rgba(0,0,0,0.2)' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'var(--color-accent-glow)', border: '2px solid var(--color-success)', display: 'flex', justifyContent: 'center', alignItems: 'center', margin: '0 auto 12px', fontWeight: 'bold' }}>5</div>
                  <EditableText as="h4" id="lifecycle_t5" defaultText="Р­РєСЃРїРµСЂС‚РёР·Р°" isVisualBuilder={isVisualBuilder} style={{ fontSize: '0.9rem', marginBottom: '5px' }} />
                  <EditableText as="p" id="lifecycle_d5" defaultText="РЎРѕРїСЂРѕРІРѕР¶РґРµРЅРёРµ РІ Р“РѕСЃСЌРєСЃРїРµСЂС‚РёР·Рµ Р Рљ" isVisualBuilder={isVisualBuilder} style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }} />
                </div>
              </div>
            </HudCard>
          </div>
        )}

        {/* ==================== PAGE: PROJECTS ==================== */}
        {activePage === 'projects' && (
          <div className="page-wrapper page-enter">
            <div key={activeSubPage || 'main'} style={{ marginBottom: '50px' }}>
              <EditableText
                as="h2"
                id={`projects_title_${activeSubPage || 'main'}`}
                isVisualBuilder={isVisualBuilder}
                defaultText={
                  activeSubPage === 'regions' ? 'РџСЂРѕРµРєС‚С‹ РїРѕ СЂРµРіРёРѕРЅР°Рј' :
                  activeSubPage === 'services' ? 'РџСЂРѕРµРєС‚С‹ РїРѕ РІРёРґР°Рј СѓСЃР»СѓРі' :
                  activeSubPage === 'clients' ? 'РџСЂРѕРµРєС‚С‹ РїРѕ Р·Р°РєР°Р·С‡РёРєР°Рј' :
                  activeSubPage === 'detail' ? 'РЎС‚СЂР°РЅРёС†Р° РїСЂРѕРµРєС‚Р°' :
                  'Р—Р°РІРµСЂС€РµРЅРЅС‹Рµ РџСЂРѕРµРєС‚С‹ РўРћРћ В«РЎРїРµС†РРЅР¶Р“РµРѕВ»'
                }
              />
              <EditableText
                as="p"
                id={`projects_desc_${activeSubPage || 'main'}`}
                isVisualBuilder={isVisualBuilder}
                style={{ color: 'var(--color-text-secondary)' }}
                defaultText="РђСЂС…РёРІ РёРЅР¶РµРЅРµСЂРЅРѕ-РіРµРѕР»РѕРіРёС‡РµСЃРєРёС… РѕС‚С‡РµС‚РѕРІ Рё РіРµРѕРґРµР·РёС‡РµСЃРєРѕР№ РїСЂРёРІСЏР·РєРё (Р±РѕР»РµРµ 50 РєСЂСѓРїРЅС‹С… РѕР±СЉРµРєС‚РѕРІ)."
              />
            </div>

            {activeSubPage === 'detail' ? (
              <div style={{ padding: '60px', textAlign: 'center', border: '1px dashed var(--color-cyan)', borderRadius: '12px', marginBottom: '60px', background: 'rgba(6, 182, 212, 0.02)' }}>
                <h3 style={{ fontSize: '1.5rem', marginBottom: '15px', color: 'var(--color-cyan)' }}>Р”РµС‚Р°Р»СЊРЅР°СЏ СЃС‚СЂР°РЅРёС†Р° РїСЂРѕРµРєС‚Р° РІ СЂР°Р·СЂР°Р±РѕС‚РєРµ</h3>
                <p style={{ color: 'var(--color-text-secondary)', fontSize: '1.1rem' }}>Р’С‹Р±РµСЂРёС‚Рµ РїСЂРѕРµРєС‚ РёР· СЃРїРёСЃРєР° С‡С‚РѕР±С‹ РїСЂРѕСЃРјРѕС‚СЂРµС‚СЊ РµРіРѕ РєР°СЂС‚РѕС‡РєСѓ.</p>
                <button className="btn btn-secondary" onClick={() => setActiveSubPage('search')} style={{ marginTop: '20px' }}>Р’РµСЂРЅСѓС‚СЊСЃСЏ Рє РїРѕРёСЃРєСѓ</button>
              </div>
            ) : (
              <>
                {/* Search filter bar */}
                <div style={{ display: 'flex', gap: '15px', marginBottom: '45px' }}>
                  <div style={{ position: 'relative', flex: 1 }}>
                    <Search size={16} style={{ position: 'absolute', left: '15px', top: '15px', color: 'var(--color-text-muted)' }} />
                    <input 
                      type="text" 
                      className="form-input" 
                      style={{ paddingLeft: '45px' }}
                      placeholder="РџРѕРёСЃРє РїРѕ РЅР°Р·РІР°РЅРёСЋ, Р·Р°РєР°Р·С‡РёРєСѓ (BI Group, Air Astana, Mega Garden)..."
                      value={projectSearch}
                      onChange={(e) => setProjectSearch(e.target.value)}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '25px', marginBottom: '60px' }}>
                  {filteredProjects.map(proj => {
                    const fallbackImg = currentProjects.find(d => d.id === proj.id)?.image || '/images/rig.png';
                    const finalImg = proj.image || fallbackImg;
                    return (
                    <HudCard key={proj.id} style={{ padding: '25px', display: 'flex', flexDirection: 'column' }}>
                      <img src={finalImg} alt={proj.name} style={{ width: '100%', height: '180px', objectFit: 'cover', borderRadius: '8px', marginBottom: '15px' }} />
                      <span className="spec-label" style={{ color: 'var(--color-accent)' }}>{proj.client}</span>
                      <h3 style={{ fontSize: '1.2rem', marginBlock: '8px 12px', color: 'var(--color-text-primary)' }}>{proj.name}</h3>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>
                        <span>рџ“Ќ Р›РѕРєР°С†РёСЏ: {proj.loc}</span>
                        <span>вљ™пёЏ Р’РёРґ СЂР°Р±РѕС‚: {proj.type}</span>
                        <span>рџ“Љ РЎРїРµС†РёС„РёРєР°С†РёСЏ: {proj.specs}</span>
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', marginTop: '10px', color: 'var(--color-text-muted)' }}>Р“РћР” РЎР”РђР§Р: {proj.year || '2025'} // STATUS: ARCHIVED_OK</span>
                      </div>
                    </HudCard>
                    );
                  })}
                </div>

                <div style={{ padding: '30px', textAlign: 'center', border: '1px dashed rgba(255,255,255,0.06)', borderRadius: '12px', backgroundColor: 'rgba(255,255,255,0.01)' }}>
                  <Database size={32} color="var(--color-accent-secondary)" style={{ marginBottom: '10px', marginInline: 'auto' }} />
                  <h4 style={{ marginBottom: '6px' }}>Р’ Р°СЂС…РёРІРµ СЃРѕРґРµСЂР¶РёС‚СЃСЏ РµС‰Рµ РѕРєРѕР»Рѕ 50 Р·Р°РІРµСЂС€РµРЅРЅС‹С… РѕР±СЉРµРєС‚РѕРІ</h4>
                  <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', maxWidth: '600px', marginInline: 'auto' }}>
                    Р’СЃРµ РёР·С‹СЃРєР°РЅРёСЏ РІРЅРµСЃРµРЅС‹ РІ РµРґРёРЅСѓСЋ РіРѕСЃСѓРґР°СЂСЃС‚РІРµРЅРЅСѓСЋ Р±Р°Р·Сѓ РіСЂР°РґРѕСЃС‚СЂРѕРёС‚РµР»СЊРЅРѕРіРѕ РєР°РґР°СЃС‚СЂР° Р Рљ. Р”Р»СЏ РїРѕР»СѓС‡РµРЅРёСЏ Р°СЂС…РёРІРЅС‹С… РіРµРѕР»РѕРіРёС‡РµСЃРєРёС… СЂР°Р·СЂРµР·РѕРІ СЃРјРµР¶РЅС‹С… СѓС‡Р°СЃС‚РєРѕРІ РѕР±СЂР°С‚РёС‚РµСЃСЊ РІ РѕС‚РґРµР» РїСЂРѕРґР°Р¶.
                  </p>
                </div>
              </>
            )}
          </div>
        )}

        {/* ==================== PAGE: BLOG ==================== */}
        {activePage === 'blog' && (
          <div className="page-wrapper page-enter">
            <div style={{ marginBottom: '50px' }}>
              <h2>
                {activeSubPage === 'methods' ? 'РњРµС‚РѕРґС‹ РёСЃРїС‹С‚Р°РЅРёР№' :
                 activeSubPage === 'soils' ? 'РўРёРїС‹ РіСЂСѓРЅС‚РѕРІ' :
                 activeSubPage === 'norms' ? 'РќРѕСЂРјР°С‚РёРІРЅС‹Рµ РґРѕРєСѓРјРµРЅС‚С‹' :
                 activeSubPage === 'faq' ? 'Р§Р°СЃС‚Рѕ Р·Р°РґР°РІР°РµРјС‹Рµ РІРѕРїСЂРѕСЃС‹' :
                 activeSubPage === 'news' ? 'РќРѕРІРѕСЃС‚Рё' :
                 activeSubPage === 'photos' ? 'Р¤РѕС‚РѕРіР°Р»РµСЂРµСЏ' :
                 activeSubPage === 'videos' ? 'Р’РёРґРµРѕРјР°С‚РµСЂРёР°Р»С‹' :
                 'Р‘Р°Р·Р° Р·РЅР°РЅРёР№ / РЎС‚Р°С‚СЊРё'}
              </h2>
              <p style={{ color: 'var(--color-text-secondary)' }}>
                РџСЂРѕС„РµСЃСЃРёРѕРЅР°Р»СЊРЅС‹Рµ РјР°С‚РµСЂРёР°Р»С‹ Рѕ РіРµРѕР»РѕРіРёРё, СЃС‚Р°С‚РёС‡РµСЃРєРѕРј Р·РѕРЅРґРёСЂРѕРІР°РЅРёРё CPT Рё РЅРѕСЂРјР°С… РЎРџ Р Рљ.
              </p>
            </div>

            {(!activeSubPage || activeSubPage === 'articles') ? (
              <>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '30px', marginBottom: '60px' }}>
                  {(adminData.articles || []).map(post => (
                    <HudCard key={post.id} style={{ padding: '30px' }}>
                      
                      {post.image && (
                          <div style={{ margin: '-30px -30px 20px -30px', height: '180px', overflow: 'hidden', borderRadius: '12px 12px 0 0' }}>
                             <img src={post.image} alt={post.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          </div>
                      )}
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', fontFamily: 'var(--font-mono)', color: 'var(--color-accent)', marginBottom: '12px' }}>
                        <span>{post.category}</span>
                        <span>{post.date}</span>
                      </div>
                      <h3 style={{ fontSize: '1.25rem', marginBottom: '12px', color: 'var(--color-text-primary)' }}>{post.title}</h3>
                      <p style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)', marginBottom: '20px' }}>
                        {post.excerpt}
                      </p>
                      
                      <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>вЏ±пёЏ Р§С‚РµРЅРёРµ: {post.readTime}</span>
                        <button className="btn btn-secondary" onClick={() => { logEvent(`Opened article: ${post.title}`); setActiveArticle(post); }} style={{ padding: '5px 12px', fontSize: '0.75rem' }}>
                          Р§РёС‚Р°С‚СЊ РїРѕР»РЅРѕСЃС‚СЊСЋ
                        </button>
                      </div>
                    </HudCard>
                  ))}
                </div>

                <div style={{ padding: '30px', textAlign: 'center', border: '1px dashed rgba(255,255,255,0.06)', borderRadius: '12px', backgroundColor: 'rgba(255,255,255,0.01)' }}>
                  <BookOpen size={32} color="var(--color-accent)" style={{ marginBottom: '10px', marginInline: 'auto' }} />
                  <h4 style={{ marginBottom: '6px' }}>Р’ Р±Р»РѕРєРµ СЃС‚Р°С‚РµР№ СЃРѕРґРµСЂР¶РёС‚СЃСЏ РѕРєРѕР»Рѕ 100 РїСЂРѕС„РёР»СЊРЅС‹С… РїСѓР±Р»РёРєР°С†РёР№</h4>
                  <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', maxWidth: '600px', marginInline: 'auto' }}>
                    РњС‹ РїРёС€РµРј РїСЂРѕСЃС‚С‹Рј СЏР·С‹РєРѕРј Рѕ СЃР»РѕР¶РЅС‹С… РіСЂСѓРЅС‚РѕРІС‹С… СѓСЃР»РѕРІРёСЏС… Р РµСЃРїСѓР±Р»РёРєРё РљР°Р·Р°С…СЃС‚Р°РЅ. Р Р°Р·РґРµР» СЂРµРіСѓР»СЏСЂРЅРѕ РґРѕРїРѕР»РЅСЏРµС‚СЃСЏ РЅР°С€РёРјРё РІРµРґСѓС‰РёРјРё РёРЅР¶РµРЅРµСЂР°РјРё-РєР°РјРµСЂР°Р»СЊС‰РёРєР°РјРё.
                  </p>
                </div>
              </>
            ) : adminData.dynamicLists?.['blog_' + activeSubPage] && adminData.dynamicLists['blog_' + activeSubPage].length > 0 ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '30px', marginBottom: '60px' }}>
                {adminData.dynamicLists['blog_' + activeSubPage].map((item, idx) => (
                  <HudCard key={item.id || idx} style={{ padding: '0', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                     {item.image && (
                         <div style={{ width: '100%', height: '220px', overflow: 'hidden', background: 'rgba(0,0,0,0.2)' }}>
                            {item.image.includes('youtube.com') || item.image.includes('youtu.be') || item.image.includes('vimeo.com') ? (
                                <iframe width="100%" height="100%" src={item.image.replace('watch?v=', 'embed/').replace('youtu.be/', 'youtube.com/embed/')} frameBorder="0" allowFullScreen></iframe>
                            ) : item.image.startsWith('data:video/') || item.image.startsWith('blob:') || item.image.toLowerCase().endsWith('.mp4') || item.image.toLowerCase().endsWith('.webm') || activeSubPage === 'videos' ? (
                                <video src={item.image} controls playsInline webkit-playsinline="true" preload="auto" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            ) : (
                                <img src={item.image} alt={item.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            )}
                         </div>
                     )}
                     <div style={{ padding: '25px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                         {item.title && <h3 style={{ margin: 0, fontSize: '1.25rem', color: 'var(--color-text-primary)' }}>{item.title}</h3>}
                         {item.coeff && <span style={{ display: 'inline-block', padding: '4px 8px', background: 'rgba(6, 182, 212, 0.1)', color: 'var(--color-cyan)', borderRadius: '4px', fontSize: '0.85rem', width: 'fit-content' }}>{item.coeff}</span>}
                         {item.desc && <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--color-text-secondary)', lineHeight: '1.6', whiteSpace: 'pre-wrap' }}>{item.desc}</p>}
                     </div>
                  </HudCard>
                ))}
              </div>
            ) : (
              <div style={{ padding: '60px', textAlign: 'center', border: '1px dashed var(--color-cyan)', borderRadius: '12px', marginBottom: '60px', background: 'rgba(6, 182, 212, 0.02)' }}>
                <h3 style={{ fontSize: '1.5rem', marginBottom: '15px', color: 'var(--color-cyan)' }}>Р Р°Р·РґРµР» "{activeSubPage}" РІ СЃС‚Р°РґРёРё РЅР°РїРѕР»РЅРµРЅРёСЏ</h3>
                <p style={{ color: 'var(--color-text-secondary)', fontSize: '1.1rem' }}>РќР°С€Рё СЂРµРґР°РєС‚РѕСЂС‹ РіРѕС‚РѕРІСЏС‚ СЌРєСЃРїРµСЂС‚РЅС‹Р№ РєРѕРЅС‚РµРЅС‚ РґР»СЏ СЌС‚РѕРіРѕ СЂР°Р·РґРµР»Р°. РџРѕР¶Р°Р»СѓР№СЃС‚Р°, Р·Р°РіР»СЏРЅРёС‚Рµ РїРѕР·Р¶Рµ.</p>
                <button className="btn btn-secondary" onClick={() => setActiveSubPage('articles')} style={{ marginTop: '20px' }}>РЎРјРѕС‚СЂРµС‚СЊ РѕСЃРЅРѕРІРЅС‹Рµ СЃС‚Р°С‚СЊРё</button>
              </div>
            )}
          </div>
        )}

        {/* ==================== PAGE: EQUIPMENT ==================== */}
        {activePage === 'equipment' && (
          <div className="page-wrapper page-enter">
            <div style={{ marginBottom: '50px' }}>
              <h2>РЎРїРµС†С‚РµС…РЅРёРєР° Рё РёР·РјРµСЂРёС‚РµР»СЊРЅС‹Рµ РїСЂРёР±РѕСЂС‹</h2>
              <p style={{ color: 'var(--color-text-secondary)' }}>
                РРЅС‚РµСЂР°РєС‚РёРІРЅС‹Р№ С‡РµСЂС‚РµР¶РЅС‹Р№ CAD-РїСЂРѕСЃРјРѕС‚СЂС‰РёРє РЅР°С€РµРіРѕ РѕР±РѕСЂСѓРґРѕРІР°РЅРёСЏ Рё Р±СѓСЂРѕРІС‹С… РјР°С€РёРЅ.
              </p>
            </div>

            <div className="equip-tabs">
              <button 
                type="button" 
                className={`equip-tab ${equipCategory === 'rigs' ? 'active' : ''}`}
                onClick={() => setEquipCategory('rigs')}
              >
                Р‘СѓСЂРѕРІС‹Рµ РјР°С€РёРЅС‹ (Drill Rigs)
              </button>
              <button 
                type="button" 
                className={`equip-tab ${equipCategory === 'lab' ? 'active' : ''}`}
                onClick={() => setEquipCategory('lab')}
              >
                Р›Р°Р±РѕСЂР°С‚РѕСЂРЅС‹Рµ РєРѕРјРїР»РµРєСЃС‹
              </button>
            </div>

            {equipCategory === 'rigs' ? (
              <div className="equip-grid">
                <div className="equip-list">
                  {(adminData.dynamicLists?.['equipment_rigs_0'] || DRILLING_RIGS).map((rig, idx) => (
                    <button
                      key={rig.name}
                      type="button"
                      className={`equip-item-btn ${selectedRig === idx ? 'active' : ''}`}
                      onClick={() => setSelectedRig(idx)}
                    >
                      {rig.name}
                      <ChevronRight size={16} />
                    </button>
                  ))}
                </div>

                <div className="cad-container" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div className="cad-crosshairs"></div>
                  
                  <div>
                    <span className="hero-subtitle" style={{ fontSize: '0.7rem', color: 'var(--color-accent-secondary)' }}>
                      CAD MODEL SPECIFICATION: ACTIVE
                    </span>
                    <h3 style={{ fontSize: '1.8rem', color: 'var(--color-text-primary)', marginBottom: '15px' }}>{(adminData.dynamicLists?.['equipment_rigs_0'] || DRILLING_RIGS)[selectedRig]?.name}</h3>
                    <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.95rem', marginBottom: '30px' }}>
                      {(adminData.dynamicLists?.['equipment_rigs_0'] || DRILLING_RIGS)[selectedRig]?.description}
                    </p>

                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '30px' }}>
                      {((typeof (adminData.dynamicLists?.['equipment_rigs_0'] || DRILLING_RIGS)[selectedRig]?.cadSpecs === 'string' ? (adminData.dynamicLists?.['equipment_rigs_0'] || DRILLING_RIGS)[selectedRig]?.cadSpecs.split(',').map(s=>s.trim()) : (adminData.dynamicLists?.['equipment_rigs_0'] || DRILLING_RIGS)[selectedRig]?.cadSpecs) || []).map(spec => (
                        <span key={spec} style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', padding: '4px 10px', borderRadius: '4px', color: 'var(--color-accent)' }}>
                          {spec}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="spec-grid">
                    <div className="spec-card">
                      <div className="spec-label">Р“Р»СѓР±РёРЅР° Р±СѓСЂРµРЅРёСЏ</div>
                      <div className="spec-value">{(adminData.dynamicLists?.['equipment_rigs_0'] || DRILLING_RIGS)[selectedRig]?.maxDepth}</div>
                    </div>
                    <div className="spec-card">
                      <div className="spec-label">РљСЂСѓС‚СЏС‰РёР№ РјРѕРјРµРЅС‚</div>
                      <div className="spec-value">{(adminData.dynamicLists?.['equipment_rigs_0'] || DRILLING_RIGS)[selectedRig]?.torque}</div>
                    </div>
                    <div className="spec-card">
                      <div className="spec-label">РњР°СЃСЃР° СѓСЃС‚Р°РЅРѕРІРєРё</div>
                      <div className="spec-value">{(adminData.dynamicLists?.['equipment_rigs_0'] || DRILLING_RIGS)[selectedRig]?.weight}</div>
                    </div>
                    <div className="spec-card">
                      <div className="spec-label">РўСЂР°РЅСЃРїРѕСЂС‚РёСЂРѕРІРєР°</div>
                      <div className="spec-value">{(adminData.dynamicLists?.['equipment_rigs_0'] || DRILLING_RIGS)[selectedRig]?.mobility}</div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="equip-grid">
                <div className="equip-list">
                  {(adminData.dynamicLists?.['equipment_lab_2'] || LAB_EQUIP).map((lab, idx) => (
                    <button
                      key={lab.name}
                      type="button"
                      className={`equip-item-btn ${selectedLab === idx ? 'active' : ''}`}
                      onClick={() => setSelectedLab(idx)}
                    >
                      {lab.name}
                      <ChevronRight size={16} />
                    </button>
                  ))}
                </div>

                <div className="cad-container" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div className="cad-crosshairs"></div>
                  
                  <div>
                    <span className="hero-subtitle" style={{ fontSize: '0.7rem', color: 'var(--color-accent-secondary)' }}>
                      LAB MODEL CALIBRATION: OK
                    </span>
                    <h3 style={{ fontSize: '1.8rem', color: 'var(--color-text-primary)', marginBottom: '15px' }}>{(adminData.dynamicLists?.['equipment_lab_2'] || LAB_EQUIP)[selectedLab]?.name}</h3>
                    <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.95rem', marginBottom: '30px' }}>
                      {(adminData.dynamicLists?.['equipment_lab_2'] || LAB_EQUIP)[selectedLab]?.description}
                    </p>

                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '30px' }}>
                      {((typeof (adminData.dynamicLists?.['equipment_lab_2'] || LAB_EQUIP)[selectedLab]?.cadSpecs === 'string' ? (adminData.dynamicLists?.['equipment_lab_2'] || LAB_EQUIP)[selectedLab]?.cadSpecs.split(',').map(s=>s.trim()) : (adminData.dynamicLists?.['equipment_lab_2'] || LAB_EQUIP)[selectedLab]?.cadSpecs) || []).map(spec => (
                        <span key={spec} style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', padding: '4px 10px', borderRadius: '4px', color: 'var(--color-accent)' }}>
                          {spec}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="spec-grid">
                    <div className="spec-card" style={{ gridColumn: 'span 2' }}>
                      <div className="spec-label">РџР°СЂР°РјРµС‚СЂС‹ РёСЃРїС‹С‚Р°РЅРёР№</div>
                      <div className="spec-value">{(adminData.dynamicLists?.['equipment_lab_2'] || LAB_EQUIP)[selectedLab]?.params}</div>
                    </div>
                    <div className="spec-card">
                      <div className="spec-label">Р¦РµР»РµРІС‹Рµ СЃРІРѕР№СЃС‚РІР°</div>
                      <div className="spec-value">{(adminData.dynamicLists?.['equipment_lab_2'] || LAB_EQUIP)[selectedLab]?.purpose}</div>
                    </div>
                    <div className="spec-card">
                      <div className="spec-label">Р“РћРЎРў / Р РµРіР»Р°РјРµРЅС‚</div>
                      <div className="spec-value" style={{ color: 'var(--color-accent)' }}>{(adminData.dynamicLists?.['equipment_lab_2'] || LAB_EQUIP)[selectedLab]?.standard}</div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ==================== PAGE: DOCUMENTS ==================== */}
        {activePage === 'documents' && (
          <div className="page-wrapper page-enter">
            <div style={{ marginBottom: '50px' }}>
              <h2>Р”РѕРєСѓРјРµРЅС‚С‹ Рё Р›РёС†РµРЅР·РёРё</h2>
              <p style={{ color: 'var(--color-text-secondary)' }}>
                Р Р°Р·СЂРµС€РёС‚РµР»СЊРЅР°СЏ РґРѕРєСѓРјРµРЅС‚Р°С†РёСЏ РўРћРћ В«РЎРїРµС†РРЅР¶Р“РµРѕВ» РЅР° РїСЂРѕРІРµРґРµРЅРёРµ РёРЅР¶РµРЅРµСЂРЅРѕ-РёР·С‹СЃРєР°С‚РµР»СЊСЃРєРёС… СЂР°Р±РѕС‚ РІ РљР°Р·Р°С…СЃС‚Р°РЅРµ.
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '30px' }}>
              {(adminData.dynamicLists?.['about_documents'] || DOCUMENTS_DATA).map((doc, idx) => { doc.id = doc.id || idx; return (
                <HudCard key={doc.id || Math.random()} style={{ padding: '30px', textAlign: 'center' }}>
                  <div style={{ fontSize: '3rem', marginBottom: '20px' }}>
                    {doc.id === 'lic-gsl' && 'рџ›ЎпёЏ'}
                    {doc.id === 'accreditation' && 'рџ”¬'}
                    {doc.id.startsWith('iso') && 'рџ“њ'}
                  </div>
                  <h3 style={{ fontSize: '1.25rem', marginBottom: '8px', color: 'var(--color-text-primary)' }}>{doc.title}</h3>
                  <span className="spec-label" style={{ color: 'var(--color-accent)', marginBottom: '15px' }}>{doc.subtitle}</span>
                  <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', marginBottom: '20px' }}>{doc.desc}</p>
                  
                  <button className="btn btn-secondary" onClick={() => setCertModal({ title: doc.title, text: doc.desc })} style={{ padding: '8px 16px', fontSize: '0.8rem', width: '100%' }}>
                    РџСЂРѕСЃРјРѕС‚СЂРµС‚СЊ РґРѕРєСѓРјРµРЅС‚
                  </button>
                </HudCard>
              ); })}
            </div>
          </div>
        )}

        {/* ==================== PAGE: CALCULATOR ==================== */}
        {activePage === 'calculator' && (
          <div className="page-wrapper page-enter">
            <div style={{ marginBottom: '50px' }}>
              <h2>РџСЂРѕС„РµСЃСЃРёРѕРЅР°Р»СЊРЅС‹Р№ РљР°Р»СЊРєСѓР»СЏС‚РѕСЂ РЎРјРµС‚С‹</h2>
              <p style={{ color: 'var(--color-text-secondary)' }}>
                РЎС„РѕСЂРјРёСЂСѓР№С‚Рµ РѕС„РёС†РёР°Р»СЊРЅРѕРµ РєРѕРјРјРµСЂС‡РµСЃРєРѕРµ РїСЂРµРґР»РѕР¶РµРЅРёРµ РўРћРћ В«РЎРїРµС†РРЅР¶Р“РµРѕВ» РЅР° Р±Р°Р·Рµ Р·Р°РґР°РЅРЅС‹С… РёРЅР¶РµРЅРµСЂРЅС‹С… РїР°СЂР°РјРµС‚СЂРѕРІ.
              </p>
            </div>

            <div className="calc-layout-grid" style={{ gap: '40px', alignItems: 'flex-start', marginBottom: '60px' }}>
              <HudCard>
                <h3 style={{ marginBottom: '25px', fontSize: '1.2rem' }}>РџР°СЂР°РјРµС‚СЂС‹ СЃРєРІР°Р¶РёРЅ</h3>
                
                {/* Soil selection */}
                <div className="calc-form-group">
                  <label className="calc-label">
                    <span>РўРёРї РіСЂСѓРЅС‚РѕРІ СЃС‚СЂРѕРёС‚РµР»СЊРЅРѕРіРѕ РїСЏС‚РЅР°</span>
                    <span>{selectedSoilConfig.price} в‚ё / РїРѕРі.Рј</span>
                  </label>
                  <div className="soil-grid">
                    {Object.entries(currentSoils).map(([key, config]) => (
                      <button
                        key={key}
                        type="button"
                        className={`soil-btn ${activeSoil === key ? 'active' : ''}`}
                        onClick={() => {
                          setActiveSoil(key);
                          if (drillDepth < config.minDepth) setDrillDepth(config.minDepth);
                        }}
                      >
                        {key === 'sand' && 'РџРµСЃРєРё'}
                        {key === 'clay' && 'Р“Р»РёРЅС‹'}
                        {key === 'loam' && 'РЎСѓРіР»РёРЅРєРё'}
                        {key === 'rock' && 'РЎРєР°Р»Р°'}
                        {key === 'peat' && 'РўРѕСЂС„'}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Depth Slider */}
                <div className="calc-form-group">
                  <label className="calc-label">
                    <span>РџСЂРѕРµРєС‚РЅР°СЏ РіР»СѓР±РёРЅР° РІС‹СЂР°Р±РѕС‚РєРё (СЃРєРІР°Р¶РёРЅС‹)</span>
                    <span>{drillDepth} Рј</span>
                  </label>
                  <input 
                    type="range" 
                    min={selectedSoilConfig.minDepth} 
                    max="50" 
                    value={drillDepth}
                    onChange={(e) => setDrillDepth(parseInt(e.target.value))}
                  />
                  <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                    Р РµРєРѕРјРµРЅРґСѓРµРјС‹Р№ РјРёРЅРёРјСѓРј: {selectedSoilConfig.minDepth} Рј
                  </span>
                </div>

                {/* Area Slider */}
                <div className="calc-form-group">
                  <label className="calc-label">
                    <span>РџР»РѕС‰Р°РґСЊ РїСЏС‚РЅР° С„СѓРЅРґР°РјРµРЅС‚Р° Р·РґР°РЅРёСЏ</span>
                    <span>{buildArea} РјВІ</span>
                  </label>
                  <input 
                    type="range" 
                    min="50" 
                    max="1500" 
                    step="50"
                    value={buildArea}
                    onChange={(e) => setDrillDepth(parseInt(e.target.value))} // wait, buildArea state update:
                    onChange={(e) => setBuildArea(parseInt(e.target.value))}
                  />
                </div>

                {/* Water Table Toggle */}
                <div className="calc-form-group" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.02)', padding: '15px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <div>
                    <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>РќР°Р»РёС‡РёРµ РіСЂСѓРЅС‚РѕРІС‹С… РІРѕРґ (РІРѕРґРѕРЅР°СЃС‹С‰РµРЅРЅРѕСЃС‚СЊ)</div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>РЈРґРѕСЂРѕР¶Р°РЅРёРµ Р±СѓСЂРµРЅРёСЏ РЅР° {Math.round((calcConfig.waterCoeff - 1) * 100)}% (РѕС‚РєР°С‡РєР°, РѕР±СЃР°РґРєР°)</span>
                  </div>
                  <input 
                    type="checkbox" 
                    checked={waterTable} 
                    onChange={(e) => setWaterTable(e.target.checked)}
                    style={{ width: '20px', height: '20px', accentColor: 'var(--color-accent)' }}
                  />
                </div>

                {/* Seismic Selector */}
                <div className="calc-form-group" style={{ marginTop: '20px' }}>
                  <label className="calc-label">РЎРµР№СЃРјРёС‡РµСЃРєР°СЏ Р·РѕРЅР° РїР»РѕС‰Р°РґРєРё</label>
                  <div style={{ display: 'flex', gap: '15px' }}>
                    <button
                      type="button"
                      className={`soil-btn ${seismicZone === '6' ? 'active' : ''}`}
                      onClick={() => setSeismicZone('6')}
                      style={{ flex: 1 }}
                    >
                      6-7 Р±Р°Р»Р»РѕРІ (РђСЃС‚Р°РЅР°, РљР°СЂР°РіР°РЅРґР°)
                    </button>
                    <button
                      type="button"
                      className={`soil-btn ${seismicZone === '9' ? 'active' : ''}`}
                      onClick={() => setSeismicZone('9')}
                      style={{ flex: 1 }}
                    >
                      9 Р±Р°Р»Р»РѕРІ (РђР»РјР°С‚С‹, РЁС‹РјРєРµРЅС‚)
                    </button>
                  </div>
                </div>

              </HudCard>

              {/* Printable PDF Letterhead */}
              <div>
                <div className="offer-box">
                  <div className="offer-header">
                    <div>
                      <div className="offer-title">в›°пёЏ {adminData.global?.companyName || 'РўРћРћ В«РЎРїРµС†РРЅР¶Р“РµРѕВ»'}</div>
                      <div style={{ fontSize: '0.65rem', color: '#64748b', fontFamily: 'var(--font-mono)' }}>
                        {adminData.global?.address || 'Р Рљ, Рі. РђР»РјР°С‚С‹'}, {adminData.global?.email || 'info@spengeo.kz'} | Р‘РРќ 190440028192
                      </div>
                    </div>
                    <div className="offer-stamp">
                      РџСЂРѕРІРµСЂРµРЅРѕ РЎРџ Р Рљ
                    </div>
                  </div>

                  <div style={{ fontSize: '0.75rem', color: '#475569', marginBottom: '20px', textAlign: 'right' }}>
                    Р”Р°С‚Р°: {new Date().toLocaleDateString('ru-RU')}
                  </div>

                  <div style={{ fontSize: '0.9rem', fontWeight: 'bold', marginBottom: '15px', color: '#0f172a' }}>
                    РљРћРњРњР•Р Р§Р•РЎРљРћР• РџР Р•Р”Р›РћР–Р•РќРР• (Р РђРЎР§Р•Рў РЎРњР•РўР«)
                  </div>

                  <p style={{ fontSize: '0.8rem', color: '#334155', marginBottom: '20px', lineHeight: '1.5' }}>
                    РќР° РѕСЃРЅРѕРІР°РЅРёРё РїСЂРµРґРѕСЃС‚Р°РІР»РµРЅРЅС‹С… РґР°РЅРЅС‹С… РїРѕ РїР»РѕС‰Р°РґРё Р·Р°СЃС‚СЂРѕР№РєРё ({buildArea} РјВІ), РіР»СѓР±РёРЅРµ РІС‹СЂР°Р±РѕС‚РѕРє ({drillDepth} Рј) Рё Р»РёС‚РѕР»РѕРіРёС‡РµСЃРєРѕРјСѓ СЃС‚СЂРѕРµРЅРёСЋ РіСЂСѓРЅС‚РѕРІ ({selectedSoilConfig.name}), РЅР°РїСЂР°РІР»СЏРµРј СЃРјРµС‚Сѓ РёР·С‹СЃРєР°С‚РµР»СЊСЃРєРёС… СЂР°Р±РѕС‚:
                  </p>

                  <div style={{ overflowX: 'auto', width: '100%', paddingBottom: '10px', marginBottom: '20px' }}>
                    <table style={{ width: '100%', minWidth: '450px', fontSize: '0.75rem', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ borderBottom: '1.5px solid #0f172a', textAlign: 'left', fontWeight: 'bold' }}>
                        <th style={{ paddingBottom: '8px' }}>РќР°РёРјРµРЅРѕРІР°РЅРёРµ СЂР°Р±РѕС‚</th>
                        <th style={{ paddingBottom: '8px' }}>РћР±СЉРµРј</th>
                        <th style={{ paddingBottom: '8px' }}>РљРѕСЌС„.</th>
                        <th style={{ paddingBottom: '8px', textAlign: 'right' }}>РЎСѓРјРјР° KZT</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                        <td style={{ padding: '8px 0' }}>РРЅР¶РµРЅРµСЂРЅРѕ-РіРµРѕР»РѕРіРёС‡РµСЃРєРѕРµ Р±СѓСЂРµРЅРёРµ</td>
                        <td>{totalDrillLength} РїРѕРі.Рј</td>
                        <td>x{(waterCoeff * seismicCoeff).toFixed(2)}</td>
                        <td style={{ textAlign: 'right' }}>{estimatedCost.toLocaleString()} в‚ё</td>
                      </tr>
                      <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                        <td style={{ padding: '8px 0' }}>РћС‚Р±РѕСЂ РїСЂРѕР± РіСЂСѓРЅС‚РѕРІ Рё РІРѕРґС‹</td>
                        <td>{sampleCount} РїСЂРѕР±</td>
                        <td>РІРєР».</td>
                        <td style={{ textAlign: 'right' }}>0 в‚ё</td>
                      </tr>
                      <tr style={{ borderBottom: '1.5px solid #0f172a' }}>
                        <td style={{ padding: '8px 0' }}>РЎРѕСЃС‚Р°РІР»РµРЅРёРµ РѕС‚С‡РµС‚Р° Рё СЌРєСЃРїРµСЂС‚РёР·Р°</td>
                        <td>1 РєРѕРјРїР»РµРєС‚</td>
                        <td>РІРєР».</td>
                        <td style={{ textAlign: 'right' }}>0 в‚ё</td>
                      </tr>
                      <tr style={{ fontWeight: 'bold', fontSize: '0.85rem' }}>
                        <td style={{ padding: '12px 0' }} colSpan="3">РРўРћР“Рћ Рљ РћРџР›РђРўР•:</td>
                        <td style={{ padding: '12px 0', textAlign: 'right', color: '#b45309' }}>
                          {estimatedCost.toLocaleString()} в‚ё
                        </td>
                      </tr>
                    </tbody>
                    </table>
                  </div>

                  <div style={{ fontSize: '0.7rem', color: '#64748b', lineHeight: '1.4', borderTop: '1px solid #cbd5e1', paddingTop: '15px' }}>
                    * Р”Р°РЅРЅС‹Р№ СЂР°СЃС‡РµС‚ СЏРІР»СЏРµС‚СЃСЏ РїСЂРµРґРІР°СЂРёС‚РµР»СЊРЅС‹Рј. РўРѕС‡РЅС‹Р№ СЂР°СЃС‡РµС‚ СЃРјРµС‚С‹ РїСЂРѕРёР·РІРѕРґРёС‚СЃСЏ РїРѕСЃР»Рµ СЃРѕРіР»Р°СЃРѕРІР°РЅРёСЏ С‚РµС…РЅРёС‡РµСЃРєРѕРіРѕ Р·Р°РґР°РЅРёСЏ (РўР—) СЃ РїСЂРѕРµРєС‚РЅРѕР№ РѕСЂРіР°РЅРёР·Р°С†РёРµР№.
                  </div>
                  
                  <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                    <button className="btn btn-secondary" onClick={() => window.print()} style={{ flex: 1, padding: '10px', fontSize: '0.8rem', color: '#000', borderColor: '#cbd5e1' }}>
                      <Printer size={14} /> Р Р°СЃРїРµС‡Р°С‚Р°С‚СЊ РљРџ
                    </button>
                    <button className="btn btn-cyan" onClick={() => setActivePage('contacts')} style={{ flex: 1, padding: '10px', fontSize: '0.8rem' }}>
                      РћС‚РїСЂР°РІРёС‚СЊ РІ РЎРїРµС†РРЅР¶Р“РµРѕ
                    </button>
                  </div>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* ==================== PAGE: CONTACTS ==================== */}
        {activePage === 'contacts' && (
          <div className="page-wrapper page-enter">
            <div style={{ marginBottom: '50px' }}>
              <h2>РљРѕРЅС‚Р°РєС‚С‹ РўРћРћ В«РЎРїРµС†РРЅР¶Р“РµРѕВ»</h2>
              <p style={{ color: 'var(--color-text-secondary)', fontSize: '1.1rem' }}>
                РЎРІСЏР¶РёС‚РµСЃСЊ СЃ РЅР°РјРё РґР»СЏ РІС‹РµР·РґР° РёРЅР¶РµРЅРµСЂРѕРІ РЅР° РѕР±СЉРµРєС‚.
              </p>
            </div>

            <div className="responsive-grid-2col" style={{ gap: '50px', alignItems: 'flex-start' }}>
              <div>
                <HudCard style={{ marginBottom: '30px' }}>
                  <h3 style={{ fontSize: '1.25rem', marginBottom: '20px' }}>
                    <EditableText id="contacts_main_office_title" defaultText="Р“Р»Р°РІРЅС‹Р№ РѕС„РёСЃ" isVisualBuilder={isVisualBuilder} />
                  </h3>
                  <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.95rem', marginBottom: '15px' }}>
                    рџ“Ќ <EditableText id="contacts_address_val" defaultText={adminData.global?.address || '050000, Р РµСЃРїСѓР±Р»РёРєР° РљР°Р·Р°С…СЃС‚Р°РЅ, Рі. РђР»РјР°С‚С‹, РїСЂРѕСЃРїРµРєС‚ РђР»СЊ-Р¤Р°СЂР°Р±Рё'} isVisualBuilder={isVisualBuilder} />
                  </p>
                  <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.95rem', marginBottom: '15px' }}>
                    рџ“ћ РўРµР»РµС„РѕРЅ: <EditableText id="contacts_phone_val" defaultText={adminData.global?.phone || '+7 705 969 0101'} isVisualBuilder={isVisualBuilder} />
                  </p>
                  <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.95rem', marginBottom: '15px' }}>
                    вњ‰пёЏ Email: <EditableText id="contacts_email_val" defaultText={adminData.global?.email || 'info@spengeo.kz'} isVisualBuilder={isVisualBuilder} />
                  </p>
                </HudCard>

                {/* System Info Block */}
                <div style={{ marginBottom: '20px', padding: '20px', background: theme === 'white' ? '#f8fafc' : 'rgba(30, 41, 59, 0.5)', borderRadius: 'var(--border-radius-md)', border: theme === 'white' ? '1px solid #e2e8f0' : '1px solid var(--border-color)' }}>
                  <span className="spec-label" style={{ color: 'var(--color-cyan)', marginBottom: '10px', display: 'block' }}>Р”РѕР±СЂРѕ РїРѕР¶Р°Р»РѕРІР°С‚СЊ</span>
                  <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.95rem', lineHeight: '1.6', margin: 0 }}>
                    Р’С‹ РЅР°С…РѕРґРёС‚РµСЃСЊ РІ Р·Р°С‰РёС‰РµРЅРЅРѕР№ РїР°РЅРµР»Рё СѓРїСЂР°РІР»РµРЅРёСЏ РїР»Р°С‚С„РѕСЂРјРѕР№ РўРћРћ В«РЎРїРµС†РРЅР¶Р“РµРѕВ». Р—РґРµСЃСЊ РІС‹ РјРѕР¶РµС‚Рµ СЂРµРґР°РєС‚РёСЂРѕРІР°С‚СЊ РєРѕРЅС‚РµРЅС‚ СЃР°Р№С‚Р°, РґРѕР±Р°РІР»СЏС‚СЊ РЅРѕРІС‹Рµ СѓСЃР»СѓРіРё, СѓРїСЂР°РІР»СЏС‚СЊ Р±Р°Р·РѕР№ РїСЂРѕРµРєС‚РѕРІ Рё РѕР±РѕСЂСѓРґРѕРІР°РЅРёСЏ, Р° С‚Р°РєР¶Рµ РѕС‚СЃР»РµР¶РёРІР°С‚СЊ Р°РЅР°Р»РёС‚РёРєСѓ.
                  </p>
                </div>
              </div>

              <div className="form-card" style={{ margin: '0' }}>
                <h3 style={{ marginBottom: '20px', fontSize: '1.2rem' }}>РћС‚РїСЂР°РІРёС‚СЊ Р·Р°РїСЂРѕСЃ</h3>
                <form onSubmit={handleFormSubmit}>
                  <div className="form-group">
                    <label className="form-label">Р’Р°С€Рµ РёРјСЏ *</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      placeholder="РРјСЏ"
                      value={inquiryName}
                      onChange={(e) => setInquiryName(e.target.value)}
                      required 
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">РўРµР»РµС„РѕРЅ *</label>
                    <input 
                      type="tel" 
                      className="form-input" 
                      placeholder="+7"
                      value={inquiryPhone}
                      onChange={(e) => setInquiryPhone(e.target.value)}
                      required 
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Р’РёРґ РёР·С‹СЃРєР°РЅРёР№</label>
                    <select 
                      className="form-select"
                      value={inquiryType}
                      onChange={(e) => setInquiryType(e.target.value)}
                    >
                      <option value="geology">РРЅР¶РµРЅРµСЂРЅР°СЏ РіРµРѕР»РѕРіРёСЏ</option>
                      <option value="geodesy">РРЅР¶РµРЅРµСЂРЅР°СЏ РіРµРѕРґРµР·РёСЏ</option>
                      <option value="both">РљРѕРјРїР»РµРєСЃ (Р“РµРѕР»РѕРіРёСЏ + Р“РµРѕРґРµР·РёСЏ)</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Р”РµС‚Р°Р»Рё (Р“РѕСЂРѕРґ, РїР»РѕС‰Р°РґСЊ, РіР»СѓР±РёРЅР°)</label>
                    <textarea 
                      className="form-input" 
                      rows="3"
                      placeholder="РљРѕРјРјРµРЅС‚Р°СЂРёР№..."
                      value={inquiryMsg}
                      onChange={(e) => setInquiryMsg(e.target.value)}
                    ></textarea>
                  </div>

                  <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
                    <Send size={15} /> РћС‚РїСЂР°РІРёС‚СЊ
                  </button>

                  {inquiryStatus && (
                    <div className={`status-msg ${inquiryStatus.type === 'success' ? 'status-success' : 'status-error'}`}>
                      {inquiryStatus.type === 'success' ? <CheckCircle size={16} /> : <AlertTriangle size={16} />}
                      {inquiryStatus.text}
                    </div>
                  )}
                </form>
              </div>
            </div>
          </div>
        )}

        {/* ==================== PAGE: ADMIN ==================== */}
        {activePage === 'admin' && !isAdminLoggedIn && (
            <div className="page-wrapper page-enter" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
              <div style={{ background: theme === 'white' ? '#fff' : '#111', padding: '40px', borderRadius: '12px', width: '100%', maxWidth: '400px', border: theme === 'white' ? '1px solid #e2e8f0' : '1px solid #333', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}>
                <h2 style={{ textAlign: 'center', marginBottom: '30px', color: theme === 'white' ? '#0f172a' : '#fff' }}>Р’С…РѕРґ РІ СЃРёСЃС‚РµРјСѓ</h2>
                <form onSubmit={handleAdminLogin} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <input 
                    type="text" 
                    placeholder="Р›РѕРіРёРЅ" 
                    value={adminUser} 
                    onChange={(e) => setAdminUser(e.target.value)} 
                    style={{ padding: '12px 15px', borderRadius: '8px', border: theme === 'white' ? '1px solid #cbd5e1' : '1px solid #444', background: theme === 'white' ? '#f8fafc' : '#222', color: theme === 'white' ? '#000' : '#fff', outline: 'none' }}
                  />
                  <input 
                    type="password" 
                    placeholder="РџР°СЂРѕР»СЊ" 
                    value={adminPass} 
                    onChange={(e) => setAdminPass(e.target.value)} 
                    style={{ padding: '12px 15px', borderRadius: '8px', border: theme === 'white' ? '1px solid #cbd5e1' : '1px solid #444', background: theme === 'white' ? '#f8fafc' : '#222', color: theme === 'white' ? '#000' : '#fff', outline: 'none' }}
                  />
                  <button type="submit" className="btn btn-primary" style={{ padding: '12px', fontWeight: 'bold' }}>Р’РѕР№С‚Рё</button>
                  {adminError && <div style={{ color: '#ef4444', textAlign: 'center', fontSize: '0.9rem' }}>{adminError}</div>}
                </form>
              </div>
            </div>
        )}
        {activePage === 'admin' && isAdminLoggedIn && (
          <div className="page-wrapper page-enter" style={{ background: theme === 'white' ? '#f8fafc' : '#0a0a0a', margin: '-50px', padding: '50px', minHeight: '100vh', borderRadius: '12px' }}>
            <div style={{ maxWidth: '1200px', margin: '0 auto', color: theme === 'white' ? '#0f172a' : '#fff', fontFamily: 'sans-serif' }}>
              <div style={{ marginBottom: '40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h1 style={{ fontSize: '2rem', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '-0.02em', marginBottom: '8px', color: theme === 'white' ? '#0f172a' : '#fff' }}>
                    {activeAdminSection === 'dashboard' ? 'Р’С‹Р±РµСЂРёС‚Рµ СЂР°Р·РґРµР» РґР»СЏ СѓРїСЂР°РІР»РµРЅРёСЏ' : 
                     activeAdminSection === 'leads' ? 'РЈРїСЂР°РІР»РµРЅРёРµ Р·Р°СЏРІРєР°РјРё' :
                     activeAdminSection === 'services' ? 'РЈРїСЂР°РІР»РµРЅРёРµ СѓСЃР»СѓРіР°РјРё' :
                     activeAdminSection === 'content' ? 'РЈРїСЂР°РІР»РµРЅРёРµ РєРѕРЅС‚РµРЅС‚РѕРј' :
                     activeAdminSection === 'pages' ? 'РЎС‚СЂСѓРєС‚СѓСЂР° СЃС‚СЂР°РЅРёС†' :
                     activeAdminSection === 'settings' ? 'Р“Р»РѕР±Р°Р»СЊРЅС‹Рµ РЅР°СЃС‚СЂРѕР№РєРё' :
                     activeAdminSection === 'bot' ? 'РќР°СЃС‚СЂРѕР№РєРё Р°СЃСЃРёСЃС‚РµРЅС‚Р°' :
                     activeAdminSection === 'calculator' ? 'РќР°СЃС‚СЂРѕР№РєРё РєР°Р»СЊРєСѓР»СЏС‚РѕСЂР°' :
                     activeAdminSection === 'blocks' ? 'РЈРїСЂР°РІР»РµРЅРёРµ Р‘Р°Р·Р°РјРё Р”Р°РЅРЅС‹С…' :
                     activeAdminSection === 'director' ? 'Р СѓРєРѕРІРѕРґСЃС‚РІРѕ РєРѕРјРїР°РЅРёРё (РћСЃРЅРѕРІР°С‚РµР»СЊ)' :
                     activeAdminSection === 'photos' ? 'РЈРїСЂР°РІР»РµРЅРёРµ С„РѕС‚РѕРіСЂР°С„РёСЏРјРё' : 'РџР°РЅРµР»СЊ СѓРїСЂР°РІР»РµРЅРёСЏ'}
                  </h1>
                  <p style={{ fontSize: '0.9rem', color: theme === 'white' ? '#64748b' : '#888' }}>
                    {activeAdminSection === 'dashboard' ? 'РќР°Р¶РјРёС‚Рµ РЅР° РїР»РёС‚РєСѓ С‡С‚РѕР±С‹ РѕС‚РєСЂС‹С‚СЊ РЅСѓР¶РЅС‹Р№ СЂР°Р·РґРµР» Р°РґРјРёРЅРёСЃС‚СЂРёСЂРѕРІР°РЅРёСЏ.' : 'Р’РЅРѕСЃРёС‚Рµ РёР·РјРµРЅРµРЅРёСЏ Рё СЃРѕС…СЂР°РЅСЏР№С‚Рµ РЅР°СЃС‚СЂРѕР№РєРё.'}
                  </p>
                </div>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                  <button 
                    onClick={() => saveAdminData()} 
                    disabled={isSavingAdmin}
                    style={{ 
                      background: 'linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%)', 
                      color: '#fff', 
                      border: 'none', 
                      padding: '10px 22px', 
                      borderRadius: '8px', 
                      cursor: isSavingAdmin ? 'wait' : 'pointer', 
                      fontWeight: 'bold', 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '8px',
                      boxShadow: '0 4px 15px rgba(6, 182, 212, 0.4)',
                      opacity: isSavingAdmin ? 0.7 : 1,
                      transition: 'all 0.2s'
                    }}
                  >
                    {isSavingAdmin ? 'вЏі РЎРѕС…СЂР°РЅРµРЅРёРµ...' : 'рџ’ѕ РЎРѕС…СЂР°РЅРёС‚СЊ РёР·РјРµРЅРµРЅРёСЏ'}
                  </button>

                  <button 
                    onClick={() => syncAdminDataFromServer(true)} 
                    style={{ 
                      background: theme === 'white' ? '#f1f5f9' : 'rgba(6, 182, 212, 0.1)', 
                      color: theme === 'white' ? '#0f172a' : '#06b6d4', 
                      border: theme === 'white' ? '1px solid #cbd5e1' : '1px solid rgba(6, 182, 212, 0.3)', 
                      padding: '10px 18px', 
                      borderRadius: '8px', 
                      cursor: 'pointer', 
                      fontWeight: 'bold', 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '6px' 
                    }}
                  >
                    рџ”„ Р—Р°РіСЂСѓР·РёС‚СЊ СЃ СЃРµСЂРІРµСЂР°
                  </button>

                  {activeAdminSection === 'dashboard' && (
                    <>
                      <button onClick={() => {
                        const fileInput = document.createElement('input');
                        fileInput.type = 'file';
                        fileInput.accept = '.json';
                        fileInput.onchange = (e) => {
                          const file = e.target.files[0];
                          if (!file) return;
                          const reader = new FileReader();
                          reader.onload = (ev) => {
                            try {
                              const parsed = JSON.parse(ev.target.result);
                              setAdminData(parsed);
                              saveAdminData(parsed);
                              alert('Р”Р°РЅРЅС‹Рµ СѓСЃРїРµС€РЅРѕ РёРјРїРѕСЂС‚РёСЂРѕРІР°РЅС‹ Рё СЃРѕС…СЂР°РЅРµРЅС‹ РЅР° СЃРµСЂРІРµСЂРµ!');
                            } catch(err) {
                              alert('РћС€РёР±РєР° РїСЂРё С‡С‚РµРЅРёРё С„Р°Р№Р»Р° JSON: ' + err.message);
                            }
                          };
                          reader.readAsText(file);
                        };
                        fileInput.click();
                      }} style={{ background: theme === 'white' ? '#f1f5f9' : 'rgba(6, 182, 212, 0.1)', color: theme === 'white' ? '#0f172a' : '#06b6d4', border: theme === 'white' ? '1px solid #cbd5e1' : '1px solid rgba(6, 182, 212, 0.3)', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        рџ“Ґ РРјРїРѕСЂС‚ (JSON)
                      </button>
                      <button onClick={() => {
                        const dataStr = JSON.stringify(adminData, null, 2);
                        const blob = new Blob([dataStr], { type: 'application/json' });
                        const url = URL.createObjectURL(blob);
                        const link = document.createElement('a');
                        link.href = url;
                        link.download = 'spengeo_admin_backup_' + new Date().toISOString().split('T')[0] + '.json';
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                      }} style={{ background: theme === 'white' ? '#f1f5f9' : 'rgba(59, 130, 246, 0.1)', color: theme === 'white' ? '#0f172a' : '#3b82f6', border: theme === 'white' ? '1px solid #cbd5e1' : '1px solid rgba(59, 130, 246, 0.3)', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        рџ“¤ Р­РєСЃРїРѕСЂС‚ (JSON)
                      </button>
                    </>
                  )}
                  {activeAdminSection !== 'dashboard' && (
                    <button onClick={() => setActiveAdminSection('dashboard')} style={{ background: theme === 'white' ? '#f1f5f9' : '#222', color: theme === 'white' ? '#0f172a' : '#fff', border: theme === 'white' ? '1px solid #cbd5e1' : '1px solid #333', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
                      в†ђ РќР°Р·Р°Рґ РІ РїР°РЅРµР»СЊ
                    </button>
                  )}
                  <button onClick={() => {
                    setIsAdminLoggedIn(false);
                    localStorage.removeItem('spengeo_admin_auth');
                    localStorage.removeItem('spengeo_active_admin_section');
                    setActiveAdminSection('dashboard');
                    if (typeof window !== 'undefined') {
                      window.history.replaceState({}, '', '/admin');
                    }
                  }} style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.3)', padding: '10px 18px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    рџљЄ Р’С‹Р№С‚Рё
                  </button>
                </div>
              </div>

              {adminSaveStatus && (
                <div style={{
                  padding: '14px 20px',
                  borderRadius: '8px',
                  marginBottom: '25px',
                  fontWeight: '600',
                  fontSize: '0.95rem',
                  background: adminSaveStatus.type === 'success' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                  border: adminSaveStatus.type === 'success' ? '1px solid #10b981' : '1px solid #f59e0b',
                  color: adminSaveStatus.type === 'success' ? '#10b981' : '#f59e0b',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                }}>
                  <span>{adminSaveStatus.text}</span>
                  <button onClick={() => setAdminSaveStatus(null)} style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', fontWeight: 'bold', fontSize: '1.1rem' }}>вњ•</button>
                </div>
              )}

              {activeAdminSection === 'dashboard' && (
                <>
                  <h3 style={{fontSize: '1.25rem', marginBottom: '20px', color: theme === 'white' ? '#0f172a' : '#fff'}}>РЈРїСЂР°РІР»РµРЅРёРµ СЃС‚СЂСѓРєС‚СѓСЂРѕР№ СЃР°Р№С‚Р°</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px', marginBottom: '40px' }}>
                    {dynamicMenu['ru'].map((menuItem, idx) => {
                      const itemsCount = menuItem.items ? menuItem.items.length : 0;
                      const colors = ['rgba(59, 130, 246', 'rgba(16, 185, 129', 'rgba(59, 130, 246', 'rgba(168, 85, 247', 'rgba(236, 72, 153', 'rgba(6, 182, 212', 'rgba(245, 158, 11'];
                      const col = colors[idx % colors.length];
                      return (
                        <div key={idx} onClick={() => setActiveAdminSection('cms_' + menuItem.page)} style={{ position: 'relative', overflow: 'hidden', borderRadius: '12px', background: theme === 'white' ? '#fff' : '#111', border: theme === 'white' ? `1px solid ${col}, 0.4)` : `1px solid ${col}, 0.3)`, padding: '24px', display: 'flex', flexDirection: 'column', cursor: 'pointer', transition: 'transform 0.2s', boxShadow: theme === 'white' ? '0 4px 20px rgba(0,0,0,0.05)' : 'none' }}>
                          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '100px', background: `linear-gradient(to bottom, ${col}, 0.15), transparent)`, pointerEvents: 'none' }}></div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '40px', position: 'relative', zIndex: 1 }}>
                            <div style={{ background: theme === 'white' ? `${col}, 0.1)` : 'rgba(0,0,0,0.4)', border: theme === 'white' ? `1px solid ${col}, 0.2)` : '1px solid rgba(255,255,255,0.05)', padding: '8px', borderRadius: '8px', color: `${col}, 1)` }}>
                              <Folder size={24} />
                            </div>
                            <div style={{ textAlign: 'right' }}>
                              <div style={{ fontSize: '1.5rem', fontWeight: 'bold', lineHeight: 1 }}>{itemsCount}</div>
                              <div style={{ fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: theme === 'white' ? '#64748b' : '#888', marginTop: '4px' }}>РїРѕРґСЂР°Р·РґРµР»РѕРІ</div>
                            </div>
                          </div>
                          <div style={{ marginTop: 'auto', position: 'relative', zIndex: 1 }}>
                            <div style={{ fontSize: '0.65rem', fontFamily: 'monospace', textTransform: 'uppercase', letterSpacing: '0.2em', color: theme === 'white' ? '#64748b' : '#888', marginBottom: '8px' }}>РљРѕРЅС‚РµРЅС‚ СЂР°Р·РґРµР»Р°</div>
                            <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '12px', color: theme === 'white' ? '#0f172a' : '#fff' }}>{menuItem.title}</h2>
                            <div style={{ fontSize: '0.85rem', fontWeight: 500, color: `${col}, 1)` }}>Р РµРґР°РєС‚РёСЂРѕРІР°С‚СЊ РїРѕРґСЂР°Р·РґРµР»С‹ в†’</div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <h3 style={{fontSize: '1.25rem', marginBottom: '20px', color: theme === 'white' ? '#0f172a' : '#fff'}}>Backend РЎРёСЃС‚РµРјС‹</h3>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
                {/* 1. Leads */}
                <div onClick={() => setActiveAdminSection('leads')} style={{ position: 'relative', overflow: 'hidden', borderRadius: '12px', background: theme === 'white' ? '#fff' : '#111', border: theme === 'white' ? '1px solid rgba(16, 185, 129, 0.4)' : '1px solid rgba(16, 185, 129, 0.3)', padding: '24px', display: 'flex', flexDirection: 'column', cursor: 'pointer', transition: 'transform 0.2s', boxShadow: theme === 'white' ? '0 4px 20px rgba(0,0,0,0.05)' : 'none' }}>
                  <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '100px', background: 'linear-gradient(to bottom, rgba(16, 185, 129, 0.15), transparent)', pointerEvents: 'none' }}></div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '40px', position: 'relative', zIndex: 1 }}>
                    <div style={{ background: theme === 'white' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(0,0,0,0.4)', border: theme === 'white' ? '1px solid rgba(16, 185, 129, 0.2)' : '1px solid rgba(255,255,255,0.05)', padding: '8px', borderRadius: '8px', color: '#10b981' }}>
                      <Database size={24} />
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '1.5rem', fontWeight: 'bold', lineHeight: 1 }}>{inquiries.length}</div>
                      <div style={{ fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: theme === 'white' ? '#64748b' : '#888', marginTop: '4px' }}>Р·Р°СЏРІРѕРє</div>
                    </div>
                  </div>
                  <div style={{ marginTop: 'auto', position: 'relative', zIndex: 1 }}>
                    <div style={{ fontSize: '0.65rem', fontFamily: 'monospace', textTransform: 'uppercase', letterSpacing: '0.2em', color: theme === 'white' ? '#64748b' : '#888', marginBottom: '8px' }}>РћР±СЂР°Р±РѕС‚РєР° Р»РёРґРѕРІ</div>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '12px' }}>Р’С…РѕРґСЏС‰РёРµ Р·Р°СЏРІРєРё</h2>
                    <p style={{ fontSize: '0.85rem', color: theme === 'white' ? '#475569' : '#aaa', marginBottom: '24px', lineHeight: 1.5 }}>РЈРїСЂР°РІР»СЏР№С‚Рµ РІС…РѕРґСЏС‰РёРјРё Р»РёРґР°РјРё СЃ СЃР°Р№С‚Р°. Р—РІРѕРЅРёС‚Рµ РєР»РёРµРЅС‚Р°Рј Рё РјРµРЅСЏР№С‚Рµ СЃС‚Р°С‚СѓСЃС‹.</p>
                    <div style={{ fontSize: '0.85rem', fontWeight: 500, color: '#10b981' }}>РЈРїСЂР°РІР»РµРЅРёРµ в†’</div>
                  </div>
                </div>

                {/* 2. Services */}
                <div onClick={() => setActiveAdminSection('services')} style={{ position: 'relative', overflow: 'hidden', borderRadius: '12px', background: theme === 'white' ? '#fff' : '#111', border: theme === 'white' ? '1px solid rgba(59, 130, 246, 0.4)' : '1px solid rgba(59, 130, 246, 0.3)', padding: '24px', display: 'flex', flexDirection: 'column', cursor: 'pointer', transition: 'transform 0.2s', boxShadow: theme === 'white' ? '0 4px 20px rgba(0,0,0,0.05)' : 'none' }}>
                  <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '100px', background: 'linear-gradient(to bottom, rgba(59, 130, 246, 0.15), transparent)', pointerEvents: 'none' }}></div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '40px', position: 'relative', zIndex: 1 }}>
                    <div style={{ background: theme === 'white' ? 'rgba(59, 130, 246, 0.1)' : 'rgba(0,0,0,0.4)', border: theme === 'white' ? '1px solid rgba(59, 130, 246, 0.2)' : '1px solid rgba(255,255,255,0.05)', padding: '8px', borderRadius: '8px', color: '#3b82f6' }}>
                      <Briefcase size={24} />
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '1.5rem', fontWeight: 'bold', lineHeight: 1 }}>{adminData.services.length}</div>
                      <div style={{ fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: theme === 'white' ? '#64748b' : '#888', marginTop: '4px' }}>СѓСЃР»СѓРі</div>
                    </div>
                  </div>
                  <div style={{ marginTop: 'auto', position: 'relative', zIndex: 1 }}>
                    <div style={{ fontSize: '0.65rem', fontFamily: 'monospace', textTransform: 'uppercase', letterSpacing: '0.2em', color: theme === 'white' ? '#64748b' : '#888', marginBottom: '8px' }}>РЎРїРёСЃРѕРє СѓСЃР»СѓРі</div>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '12px' }}>РЈСЃР»СѓРіРё</h2>
                    <p style={{ fontSize: '0.85rem', color: theme === 'white' ? '#475569' : '#aaa', marginBottom: '24px', lineHeight: 1.5 }}>РЈРїСЂР°РІР»СЏР№С‚Рµ РѕРїРёСЃР°РЅРёРµРј СѓСЃР»СѓРі, РёР·РѕР±СЂР°Р¶РµРЅРёСЏРјРё, РІРёРґРµРѕ Рё РїРµСЂРµРІРѕРґР°РјРё.</p>
                    <div style={{ fontSize: '0.85rem', fontWeight: 500, color: '#3b82f6' }}>РЈРїСЂР°РІР»РµРЅРёРµ в†’</div>
                  </div>
                </div>

                {/* 3. Visual Builder */}
                <div onClick={() => { setIsVisualBuilder(true); setActivePage('home'); }} style={{ position: 'relative', overflow: 'hidden', borderRadius: '12px', background: theme === 'white' ? '#fff' : '#111', border: theme === 'white' ? '1px solid rgba(168, 85, 247, 0.4)' : '1px solid rgba(168, 85, 247, 0.3)', padding: '24px', display: 'flex', flexDirection: 'column', cursor: 'pointer', transition: 'transform 0.2s', boxShadow: theme === 'white' ? '0 4px 20px rgba(0,0,0,0.05)' : 'none' }}>
                  <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '100px', background: 'linear-gradient(to bottom, rgba(168, 85, 247, 0.15), transparent)', pointerEvents: 'none' }}></div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '40px', position: 'relative', zIndex: 1 }}>
                    <div style={{ background: theme === 'white' ? 'rgba(168, 85, 247, 0.1)' : 'rgba(0,0,0,0.4)', border: theme === 'white' ? '1px solid rgba(168, 85, 247, 0.2)' : '1px solid rgba(255,255,255,0.05)', padding: '8px', borderRadius: '8px', color: '#a855f7' }}>
                      <Edit3 size={24} />
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '1.5rem', fontWeight: 'bold', lineHeight: 1 }}>
                        {dynamicMenu[language].reduce((acc, curr) => acc + 1 + (curr.items ? curr.items.length : 0), 0)}
                      </div>
                      <div style={{ fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: theme === 'white' ? '#64748b' : '#888', marginTop: '4px' }}>СЃС‚СЂР°РЅРёС†</div>
                    </div>
                  </div>
                  <div style={{ marginTop: 'auto', position: 'relative', zIndex: 1 }}>
                    <div style={{ fontSize: '0.65rem', fontFamily: 'monospace', textTransform: 'uppercase', letterSpacing: '0.2em', color: theme === 'white' ? '#64748b' : '#888', marginBottom: '8px' }}>РљРѕРЅСЃС‚СЂСѓРєС‚РѕСЂ СЃС‚СЂР°РЅРёС†</div>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '12px' }}>Visual Builder</h2>
                    <p style={{ fontSize: '0.85rem', color: theme === 'white' ? '#475569' : '#aaa', marginBottom: '24px', lineHeight: 1.5 }}>Р РµРґР°РєС‚РёСЂСѓР№С‚Рµ С‚РµРєСЃС‚С‹, Р·Р°РіРѕР»РѕРІРєРё Рё Р±Р»РѕРєРё РїСЂСЏРјРѕ РЅР° СЃС‚СЂР°РЅРёС†Р°С… СЃР°Р№С‚Р°.</p>
                    <div style={{ fontSize: '0.85rem', fontWeight: 500, color: '#a855f7' }}>РћС‚РєСЂС‹С‚СЊ Builder в†’</div>
                  </div>
                </div>

                {/* 4. Content */}
                <div onClick={() => setActiveAdminSection('content')} style={{ position: 'relative', overflow: 'hidden', borderRadius: '12px', background: theme === 'white' ? '#fff' : '#111', border: theme === 'white' ? '1px solid rgba(59, 130, 246, 0.4)' : '1px solid rgba(59, 130, 246, 0.3)', padding: '24px', display: 'flex', flexDirection: 'column', cursor: 'pointer', transition: 'transform 0.2s', boxShadow: theme === 'white' ? '0 4px 20px rgba(0,0,0,0.05)' : 'none' }}>
                  <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '100px', background: 'linear-gradient(to bottom, rgba(59, 130, 246, 0.15), transparent)', pointerEvents: 'none' }}></div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '40px', position: 'relative', zIndex: 1 }}>
                    <div style={{ background: theme === 'white' ? 'rgba(59, 130, 246, 0.1)' : 'rgba(0,0,0,0.4)', border: theme === 'white' ? '1px solid rgba(59, 130, 246, 0.2)' : '1px solid rgba(255,255,255,0.05)', padding: '8px', borderRadius: '8px', color: '#3b82f6' }}>
                      <BookOpen size={24} />
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '1.5rem', fontWeight: 'bold', lineHeight: 1 }}>{Object.keys(translations).length}</div>
                      <div style={{ fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: theme === 'white' ? '#64748b' : '#888', marginTop: '4px' }}>СЏР·С‹РєР°</div>
                    </div>
                  </div>
                  <div style={{ marginTop: 'auto', position: 'relative', zIndex: 1 }}>
                    <div style={{ fontSize: '0.65rem', fontFamily: 'monospace', textTransform: 'uppercase', letterSpacing: '0.2em', color: theme === 'white' ? '#64748b' : '#888', marginBottom: '8px' }}>РўРµРєСЃС‚С‹ Рё РїРµСЂРµРІРѕРґС‹</div>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '12px' }}>РљРѕРЅС‚РµРЅС‚</h2>
                    <p style={{ fontSize: '0.85rem', color: theme === 'white' ? '#475569' : '#aaa', marginBottom: '24px', lineHeight: 1.5 }}>Р РµРґР°РєС‚РёСЂСѓР№С‚Рµ РІСЃРµ С‚РµРєСЃС‚С‹ СЃР°Р№С‚Р° РЅР° СЂСѓСЃСЃРєРѕРј, РєР°Р·Р°С…СЃРєРѕРј Рё Р°РЅРіР»РёР№СЃРєРѕРј СЏР·С‹РєР°С….</p>
                    <div style={{ fontSize: '0.85rem', fontWeight: 500, color: '#3b82f6' }}>Р РµРґР°РєС‚РёСЂРѕРІР°С‚СЊ в†’</div>
                  </div>
                </div>

                {/* 5. Pages */}
                <div onClick={() => setActiveAdminSection('pages')} style={{ position: 'relative', overflow: 'hidden', borderRadius: '12px', background: theme === 'white' ? '#fff' : '#111', border: theme === 'white' ? '1px solid rgba(236, 72, 153, 0.4)' : '1px solid rgba(236, 72, 153, 0.3)', padding: '24px', display: 'flex', flexDirection: 'column', cursor: 'pointer', transition: 'transform 0.2s', boxShadow: theme === 'white' ? '0 4px 20px rgba(0,0,0,0.05)' : 'none' }}>
                  <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '100px', background: 'linear-gradient(to bottom, rgba(236, 72, 153, 0.15), transparent)', pointerEvents: 'none' }}></div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '40px', position: 'relative', zIndex: 1 }}>
                    <div style={{ background: theme === 'white' ? 'rgba(236, 72, 153, 0.1)' : 'rgba(0,0,0,0.4)', border: theme === 'white' ? '1px solid rgba(236, 72, 153, 0.2)' : '1px solid rgba(255,255,255,0.05)', padding: '8px', borderRadius: '8px', color: '#ec4899' }}>
                      <FileText size={24} />
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '1.5rem', fontWeight: 'bold', lineHeight: 1 }}>
                        {dynamicMenu[language].reduce((acc, curr) => acc + 1 + (curr.items ? curr.items.length : 0), 0)}
                      </div>
                      <div style={{ fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: theme === 'white' ? '#64748b' : '#888', marginTop: '4px' }}>СЃС‚СЂР°РЅРёС†</div>
                    </div>
                  </div>
                  <div style={{ marginTop: 'auto', position: 'relative', zIndex: 1 }}>
                    <div style={{ fontSize: '0.65rem', fontFamily: 'monospace', textTransform: 'uppercase', letterSpacing: '0.2em', color: theme === 'white' ? '#64748b' : '#888', marginBottom: '8px' }}>РЎС‚СЂСѓРєС‚СѓСЂР° СЃР°Р№С‚Р°</div>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '12px' }}>РњРµРЅСЋ Рё РЎС‚СЂР°РЅРёС†С‹</h2>
                    <p style={{ fontSize: '0.85rem', color: theme === 'white' ? '#475569' : '#aaa', marginBottom: '24px', lineHeight: 1.5 }}>РЈРїСЂР°РІР»РµРЅРёРµ РїСѓРЅРєС‚Р°РјРё РЅР°РІРёРіР°С†РёРё Рё РёРµСЂР°СЂС…РёРµР№ СЃС‚СЂР°РЅРёС†.</p>
                    <div style={{ fontSize: '0.85rem', fontWeight: 500, color: '#ec4899' }}>Р РµРґР°РєС‚РёСЂРѕРІР°С‚СЊ в†’</div>
                  </div>
                </div>

                {/* 6. Calculator Settings */}
                <div onClick={() => setActiveAdminSection('calculator')} style={{ position: 'relative', overflow: 'hidden', borderRadius: '12px', background: theme === 'white' ? '#fff' : '#111', border: theme === 'white' ? '1px solid rgba(245, 158, 11, 0.4)' : '1px solid rgba(245, 158, 11, 0.3)', padding: '24px', display: 'flex', flexDirection: 'column', cursor: 'pointer', transition: 'transform 0.2s', boxShadow: theme === 'white' ? '0 4px 20px rgba(0,0,0,0.05)' : 'none' }}>
                  <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '100px', background: 'linear-gradient(to bottom, rgba(245, 158, 11, 0.15), transparent)', pointerEvents: 'none' }}></div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '40px', position: 'relative', zIndex: 1 }}>
                    <div style={{ background: theme === 'white' ? 'rgba(245, 158, 11, 0.1)' : 'rgba(0,0,0,0.4)', border: theme === 'white' ? '1px solid rgba(245, 158, 11, 0.2)' : '1px solid rgba(255,255,255,0.05)', padding: '8px', borderRadius: '8px', color: '#f59e0b' }}>
                      <Calculator size={24} />
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '1.5rem', fontWeight: 'bold', lineHeight: 1 }}>6</div>
                      <div style={{ fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: theme === 'white' ? '#64748b' : '#888', marginTop: '4px' }}>РїР°СЂР°РјРµС‚СЂРѕРІ</div>
                    </div>
                  </div>
                  <div style={{ marginTop: 'auto', position: 'relative', zIndex: 1 }}>
                    <div style={{ fontSize: '0.65rem', fontFamily: 'monospace', textTransform: 'uppercase', letterSpacing: '0.2em', color: theme === 'white' ? '#64748b' : '#888', marginBottom: '8px' }}>Р Р°СЃС‡РµС‚С‹ СЃРјРµС‚С‹</div>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '12px' }}>РљР°Р»СЊРєСѓР»СЏС‚РѕСЂ</h2>
                    <p style={{ fontSize: '0.85rem', color: theme === 'white' ? '#475569' : '#aaa', marginBottom: '24px', lineHeight: 1.5 }}>РќР°СЃС‚СЂРѕР№РєР° Р±Р°Р·РѕРІРѕР№ СЃС‚РѕРёРјРѕСЃС‚Рё Р±СѓСЂРµРЅРёСЏ Рё РїРѕРІС‹С€Р°СЋС‰РёС… РєРѕСЌС„С„РёС†РёРµРЅС‚РѕРІ.</p>
                    <div style={{ fontSize: '0.85rem', fontWeight: 500, color: '#f59e0b' }}>РќР°СЃС‚СЂРѕРёС‚СЊ в†’</div>
                  </div>
                </div>

                {/* 7. Blocks */}
                <div onClick={() => setActiveAdminSection('blocks')} style={{ position: 'relative', overflow: 'hidden', borderRadius: '12px', background: theme === 'white' ? '#fff' : '#111', border: theme === 'white' ? '1px solid rgba(16, 185, 129, 0.4)' : '1px solid rgba(16, 185, 129, 0.3)', padding: '24px', display: 'flex', flexDirection: 'column', cursor: 'pointer', transition: 'transform 0.2s', boxShadow: theme === 'white' ? '0 4px 20px rgba(0,0,0,0.05)' : 'none' }}>
                  <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '100px', background: 'linear-gradient(to bottom, rgba(16, 185, 129, 0.15), transparent)', pointerEvents: 'none' }}></div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '40px', position: 'relative', zIndex: 1 }}>
                    <div style={{ background: theme === 'white' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(0,0,0,0.4)', border: theme === 'white' ? '1px solid rgba(16, 185, 129, 0.2)' : '1px solid rgba(255,255,255,0.05)', padding: '8px', borderRadius: '8px', color: '#10b981' }}>
                      <Database size={24} />
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '1.5rem', fontWeight: 'bold', lineHeight: 1 }}>4</div>
                      <div style={{ fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: theme === 'white' ? '#64748b' : '#888', marginTop: '4px' }}>Р±Р°Р·С‹</div>
                    </div>
                  </div>
                  <div style={{ marginTop: 'auto', position: 'relative', zIndex: 1 }}>
                    <div style={{ fontSize: '0.65rem', fontFamily: 'monospace', textTransform: 'uppercase', letterSpacing: '0.2em', color: theme === 'white' ? '#64748b' : '#888', marginBottom: '8px' }}>Р‘Р°Р·С‹ РґР°РЅРЅС‹С…</div>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '12px' }}>Р‘Р»РѕРєРё Рё Р¤РѕС‚Рѕ</h2>
                    <p style={{ fontSize: '0.85rem', color: theme === 'white' ? '#475569' : '#aaa', marginBottom: '24px', lineHeight: 1.5 }}>Р РµРґР°РєС‚РёСЂРѕРІР°РЅРёРµ, РґРѕР±Р°РІР»РµРЅРёРµ РїСЂРѕРµРєС‚РѕРІ, СѓСЃР»СѓРі, РѕР±РѕСЂСѓРґРѕРІР°РЅРёСЏ Рё РєРѕРјР°РЅРґС‹ СЃ С„РѕС‚Рѕ.</p>
                    <div style={{ fontSize: '0.85rem', fontWeight: 500, color: '#10b981' }}>РЈРїСЂР°РІР»РµРЅРёРµ в†’</div>
                  </div>
                </div>

                {/* 9. Director / Founder Section */}
                <div onClick={() => setActiveAdminSection('director')} style={{ position: 'relative', overflow: 'hidden', borderRadius: '12px', background: theme === 'white' ? '#fff' : '#111', border: theme === 'white' ? '1px solid rgba(6, 182, 212, 0.4)' : '1px solid rgba(6, 182, 212, 0.3)', padding: '24px', display: 'flex', flexDirection: 'column', cursor: 'pointer', transition: 'transform 0.2s', boxShadow: theme === 'white' ? '0 4px 20px rgba(0,0,0,0.05)' : 'none' }}>
                  <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '100px', background: 'linear-gradient(to bottom, rgba(6, 182, 212, 0.15), transparent)', pointerEvents: 'none' }}></div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '40px', position: 'relative', zIndex: 1 }}>
                    <div style={{ background: theme === 'white' ? 'rgba(6, 182, 212, 0.1)' : 'rgba(0,0,0,0.4)', border: theme === 'white' ? '1px solid rgba(6, 182, 212, 0.2)' : '1px solid rgba(255,255,255,0.05)', padding: '8px', borderRadius: '8px', color: '#06b6d4' }}>
                      <User size={24} />
                    </div>
                  </div>
                  <div style={{ marginTop: 'auto', position: 'relative', zIndex: 1 }}>
                    <div style={{ fontSize: '0.65rem', fontFamily: 'monospace', textTransform: 'uppercase', letterSpacing: '0.2em', color: theme === 'white' ? '#64748b' : '#888', marginBottom: '8px' }}>РџРµСЂСЃРѕРЅР°Р»СЊРЅС‹Рµ РґР°РЅРЅС‹Рµ</div>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '12px' }}>Р СѓРєРѕРІРѕРґСЃС‚РІРѕ РєРѕРјРїР°РЅРёРё</h2>
                    <p style={{ fontSize: '0.85rem', color: theme === 'white' ? '#475569' : '#aaa', marginBottom: '24px', lineHeight: 1.5 }}>Р РµРґР°РєС‚РёСЂРѕРІР°РЅРёРµ С„РѕС‚Рѕ РћСЃРЅРѕРІР°С‚РµР»СЏ, Р¤РРћ, РґРѕР»Р¶РЅРѕСЃС‚Рё Рё РёСЃС‚РѕСЂРёРё РєРѕРјРїР°РЅРёРё.</p>
                    <div style={{ fontSize: '0.85rem', fontWeight: 500, color: '#06b6d4' }}>РЈРїСЂР°РІР»РµРЅРёРµ в†’</div>
                  </div>
                </div>

                {/* 6. Settings */}
                <div onClick={() => setActiveAdminSection('settings')} style={{ position: 'relative', overflow: 'hidden', borderRadius: '12px', background: theme === 'white' ? '#fff' : '#111', border: theme === 'white' ? '1px solid rgba(107, 114, 128, 0.4)' : '1px solid rgba(107, 114, 128, 0.3)', padding: '24px', display: 'flex', flexDirection: 'column', cursor: 'pointer', transition: 'transform 0.2s', boxShadow: theme === 'white' ? '0 4px 20px rgba(0,0,0,0.05)' : 'none' }}>
                  <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '100px', background: 'linear-gradient(to bottom, rgba(107, 114, 128, 0.15), transparent)', pointerEvents: 'none' }}></div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '40px', position: 'relative', zIndex: 1 }}>
                    <div style={{ background: theme === 'white' ? 'rgba(107, 114, 128, 0.1)' : 'rgba(0,0,0,0.4)', border: theme === 'white' ? '1px solid rgba(107, 114, 128, 0.2)' : '1px solid rgba(255,255,255,0.05)', padding: '8px', borderRadius: '8px', color: '#9ca3af' }}>
                      <Settings size={24} />
                    </div>
                  </div>
                  <div style={{ marginTop: 'auto', position: 'relative', zIndex: 1 }}>
                    <div style={{ fontSize: '0.65rem', fontFamily: 'monospace', textTransform: 'uppercase', letterSpacing: '0.2em', color: theme === 'white' ? '#64748b' : '#888', marginBottom: '8px' }}>Р“Р»РѕР±Р°Р»СЊРЅС‹Рµ РїР°СЂР°РјРµС‚СЂС‹</div>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '12px' }}>РќР°СЃС‚СЂРѕР№РєРё</h2>
                    <p style={{ fontSize: '0.85rem', color: theme === 'white' ? '#475569' : '#aaa', marginBottom: '24px', lineHeight: 1.5 }}>РќР°Р·РІР°РЅРёРµ РєРѕРјРїР°РЅРёРё, С†РІРµС‚Р°, Р»РѕРіРѕС‚РёРї, РєРѕРЅС‚Р°РєС‚РЅР°СЏ РёРЅС„РѕСЂРјР°С†РёСЏ Рё SEO.</p>
                    <div style={{ fontSize: '0.85rem', fontWeight: 500, color: '#9ca3af' }}>РќР°СЃС‚СЂРѕРёС‚СЊ в†’</div>
                  </div>
                </div>

                
                {/* 8. Photos */}
                <div onClick={() => setActiveAdminSection('photos')} style={{ position: 'relative', overflow: 'hidden', borderRadius: '12px', background: theme === 'white' ? '#fff' : '#111', border: theme === 'white' ? '1px solid rgba(168, 85, 247, 0.4)' : '1px solid rgba(168, 85, 247, 0.3)', padding: '24px', display: 'flex', flexDirection: 'column', cursor: 'pointer', transition: 'transform 0.2s', boxShadow: theme === 'white' ? '0 4px 20px rgba(0,0,0,0.05)' : 'none' }}>
                  <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '100px', background: 'linear-gradient(to bottom, rgba(168, 85, 247, 0.15), transparent)', pointerEvents: 'none' }}></div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '40px', position: 'relative', zIndex: 1 }}>
                    <div style={{ background: theme === 'white' ? 'rgba(168, 85, 247, 0.1)' : 'rgba(0,0,0,0.4)', border: theme === 'white' ? '1px solid rgba(168, 85, 247, 0.2)' : '1px solid rgba(255,255,255,0.05)', padding: '8px', borderRadius: '8px', color: '#a855f7' }}>
                      <Image size={24} />
                    </div>
                  </div>
                  <div style={{ marginTop: 'auto', position: 'relative', zIndex: 1 }}>
                    <div style={{ fontSize: '0.65rem', fontFamily: 'monospace', textTransform: 'uppercase', letterSpacing: '0.2em', color: theme === 'white' ? '#64748b' : '#888', marginBottom: '8px' }}>РњРµРґРёР°С„Р°Р№Р»С‹</div>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '12px' }}>Р¤РѕС‚РѕРіСЂР°С„РёРё</h2>
                    <p style={{ fontSize: '0.85rem', color: theme === 'white' ? '#475569' : '#aaa', marginBottom: '24px', lineHeight: 1.5 }}>РЈРїСЂР°РІР»РµРЅРёРµ С„РѕРЅРѕРІС‹РјРё РёР·РѕР±СЂР°Р¶РµРЅРёСЏРјРё Р±Р»РѕРєРѕРІ РЅР° РіР»Р°РІРЅРѕР№ СЃС‚СЂР°РЅРёС†Рµ.</p>
                    <div style={{ fontSize: '0.85rem', fontWeight: 500, color: '#a855f7' }}>Р РµРґР°РєС‚РёСЂРѕРІР°С‚СЊ в†’</div>
                  </div>
                </div>

                {/* 7. Bot */}
                <div onClick={() => setActiveAdminSection('bot')} style={{ position: 'relative', overflow: 'hidden', borderRadius: '12px', background: theme === 'white' ? '#fff' : '#111', border: theme === 'white' ? '1px solid rgba(6, 182, 212, 0.4)' : '1px solid rgba(6, 182, 212, 0.3)', padding: '24px', display: 'flex', flexDirection: 'column', cursor: 'pointer', transition: 'transform 0.2s', boxShadow: theme === 'white' ? '0 4px 20px rgba(0,0,0,0.05)' : 'none' }}>
                  <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '100px', background: 'linear-gradient(to bottom, rgba(6, 182, 212, 0.15), transparent)', pointerEvents: 'none' }}></div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '40px', position: 'relative', zIndex: 1 }}>
                    <div style={{ background: theme === 'white' ? 'rgba(6, 182, 212, 0.1)' : 'rgba(0,0,0,0.4)', border: theme === 'white' ? '1px solid rgba(6, 182, 212, 0.2)' : '1px solid rgba(255,255,255,0.05)', padding: '8px', borderRadius: '8px', color: '#06b6d4' }}>
                      <Bot size={24} />
                    </div>
                  </div>
                  <div style={{ marginTop: 'auto', position: 'relative', zIndex: 1 }}>
                    <div style={{ fontSize: '0.65rem', fontFamily: 'monospace', textTransform: 'uppercase', letterSpacing: '0.2em', color: theme === 'white' ? '#64748b' : '#888', marginBottom: '8px' }}>РќР°СЃС‚СЂРѕР№РєРё С‡Р°С‚-Р±РѕС‚Р°</div>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '12px' }}>SPENGEO_ASSISTANT</h2>
                    <p style={{ fontSize: '0.85rem', color: theme === 'white' ? '#475569' : '#aaa', marginBottom: '24px', lineHeight: 1.5 }}>РџСЂРёРІРµС‚СЃС‚РІРёСЏ, FAQ, Р°РІС‚Рѕ-РѕС‚РІРµС‚С‹, С‚РµР»РµС„РѕРЅ РїРѕРґРґРµСЂР¶РєРё Рё РёРјСЏ Р°СЃСЃРёСЃС‚РµРЅС‚Р°.</p>
                    <div style={{ fontSize: '0.85rem', fontWeight: 500, color: '#06b6d4' }}>РќР°СЃС‚СЂРѕРёС‚СЊ Р°СЃСЃРёСЃС‚РµРЅС‚Р° в†’</div>
                  </div>
                </div>
              </div>

              {/* Bottom stats row like in the screenshot */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginTop: '20px' }}>
                <div style={{ background: theme === 'white' ? '#fff' : '#111', border: theme === 'white' ? '1px solid rgba(0,0,0,0.05)' : '1px solid rgba(255,255,255,0.05)', borderRadius: '8px', padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: theme === 'white' ? '0 2px 10px rgba(0,0,0,0.02)' : 'none' }}>
                  <span style={{ fontSize: '0.85rem', color: theme === 'white' ? '#64748b' : '#888' }}>РќРѕРІС‹С… Р»РёРґРѕРІ</span>
                  <span style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#10b981' }}>{inquiries.length}</span>
                </div>
                <div style={{ background: theme === 'white' ? '#fff' : '#111', border: theme === 'white' ? '1px solid rgba(0,0,0,0.05)' : '1px solid rgba(255,255,255,0.05)', borderRadius: '8px', padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: theme === 'white' ? '0 2px 10px rgba(0,0,0,0.02)' : 'none' }}>
                  <span style={{ fontSize: '0.85rem', color: theme === 'white' ? '#64748b' : '#888' }}>РЈСЃР»СѓРі РЅР° СЃР°Р№С‚Рµ</span>
                  <span style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#3b82f6' }}>{adminData.services.length}</span>
                </div>
                <div style={{ background: theme === 'white' ? '#fff' : '#111', border: theme === 'white' ? '1px solid rgba(0,0,0,0.05)' : '1px solid rgba(255,255,255,0.05)', borderRadius: '8px', padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: theme === 'white' ? '0 2px 10px rgba(0,0,0,0.02)' : 'none' }}>
                  <span style={{ fontSize: '0.85rem', color: theme === 'white' ? '#64748b' : '#888' }}>РђРєС‚РёРІРЅС‹С… Р±РѕС‚РѕРІ</span>
                  <span style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#06b6d4' }}>1</span>
                </div>
              </div>
              
              {/* Inquiries List on Dashboard */}
              <div style={{ marginTop: '60px' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '20px', color: theme === 'white' ? '#0f172a' : '#fff' }}>РџРѕСЃР»РµРґРЅРёРµ Р·Р°СЏРІРєРё</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {inquiries.length === 0 ? (
                    <div style={{ padding: '40px', textAlign: 'center', border: theme === 'white' ? '1px dashed rgba(0,0,0,0.1)' : '1px dashed rgba(255,255,255,0.1)', borderRadius: '12px', color: theme === 'white' ? '#64748b' : '#888' }}>Р‘Р°Р·Р° РґР°РЅРЅС‹С… РїСѓСЃС‚Р°.</div>
                  ) : (
                    inquiries.map(inq => (
                      <div key={inq.id} style={{ background: theme === 'white' ? '#fff' : '#111', border: theme === 'white' ? '1px solid rgba(0,0,0,0.05)' : '1px solid rgba(255,255,255,0.05)', borderRadius: '12px', padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: theme === 'white' ? '0 2px 10px rgba(0,0,0,0.02)' : 'none' }}>
                        <div>
                          <div style={{ fontWeight: 'bold', fontSize: '1.1rem', marginBottom: '8px', color: theme === 'white' ? '#0f172a' : '#fff' }}>{inq.name} <span style={{ fontSize: '0.7rem', padding: '2px 6px', borderRadius: '4px', background: 'rgba(6, 182, 212, 0.1)', color: '#06b6d4', marginLeft: '8px' }}>{inq.service_type}</span></div>
                          <div style={{ fontSize: '0.9rem', color: theme === 'white' ? '#475569' : '#aaa', marginBottom: '8px' }}>{inq.message}</div>
                          <a href={`tel:${inq.phone}`} style={{ fontSize: '0.85rem', color: theme === 'white' ? '#0f172a' : '#fff', display: 'inline-flex', alignItems: 'center', gap: '6px', textDecoration: 'none' }}><Phone size={12} color={theme === 'white' ? '#0f172a' : '#fff'}/> {inq.phone}</a>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontSize: '0.8rem', color: theme === 'white' ? '#64748b' : '#888', marginBottom: '16px' }}>{new Date(inq.created_at).toLocaleString('ru-RU')}</div>
                          <button onClick={() => handleClearInquiry(inq.id)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}><Trash2 size={16}/></button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
              </>
              )}

              {/* ===== ADMIN SUB-PAGES ===== */}

              {activeAdminSection === 'calculator' && (
                <div style={{ background: theme === 'white' ? '#fff' : '#111', border: theme === 'white' ? '1px solid rgba(0,0,0,0.05)' : '1px solid rgba(255,255,255,0.05)', borderRadius: '12px', padding: '30px', boxShadow: theme === 'white' ? '0 4px 20px rgba(0,0,0,0.05)' : 'none' }}>
                  <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '30px', color: theme === 'white' ? '#0f172a' : '#fff', borderBottom: theme === 'white' ? '1px solid #e2e8f0' : '1px solid #333', paddingBottom: '15px' }}>РќР°СЃС‚СЂРѕР№РєРё РљР°Р»СЊРєСѓР»СЏС‚РѕСЂР°</h3>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <label style={{ fontSize: '0.85rem', color: theme === 'white' ? '#64748b' : '#888', marginBottom: '8px' }}>РљРѕСЌС„. РіСЂСѓРЅС‚РѕРІС‹С… РІРѕРґ (СѓРґРѕСЂРѕР¶Р°РЅРёРµ)</label>
                      <input 
                        type="number" step="0.01"
                        value={adminData.calc?.waterCoeff || 1.15} 
                        onChange={e => setAdminData(prev => ({...prev, calc: {...prev.calc, waterCoeff: Number(e.target.value)}}))}
                        style={{ padding: '12px', borderRadius: '8px', border: theme === 'white' ? '1px solid #cbd5e1' : '1px solid #333', background: theme === 'white' ? '#fff' : '#000', color: theme === 'white' ? '#0f172a' : '#fff' }} 
                      />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <label style={{ fontSize: '0.85rem', color: theme === 'white' ? '#64748b' : '#888', marginBottom: '8px' }}>РЎРµР№СЃРјРёРєР° 9 Р±Р°Р»Р»РѕРІ (РђР»РјР°С‚С‹)</label>
                      <input 
                        type="number" step="0.01"
                        value={adminData.calc?.seismicCoeff9 || 1.1} 
                        onChange={e => setAdminData(prev => ({...prev, calc: {...prev.calc, seismicCoeff9: Number(e.target.value)}}))}
                        style={{ padding: '12px', borderRadius: '8px', border: theme === 'white' ? '1px solid #cbd5e1' : '1px solid #333', background: theme === 'white' ? '#fff' : '#000', color: theme === 'white' ? '#0f172a' : '#fff' }} 
                      />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <label style={{ fontSize: '0.85rem', color: theme === 'white' ? '#64748b' : '#888', marginBottom: '8px' }}>РЎРµР№СЃРјРёРєР° 6-7 Р±Р°Р»Р»РѕРІ (РђСЃС‚Р°РЅР°)</label>
                      <input 
                        type="number" step="0.01"
                        value={adminData.calc?.seismicCoeff6 || 1.0} 
                        onChange={e => setAdminData(prev => ({...prev, calc: {...prev.calc, seismicCoeff6: Number(e.target.value)}}))}
                        style={{ padding: '12px', borderRadius: '8px', border: theme === 'white' ? '1px solid #cbd5e1' : '1px solid #333', background: theme === 'white' ? '#fff' : '#000', color: theme === 'white' ? '#0f172a' : '#fff' }} 
                      />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <label style={{ fontSize: '0.85rem', color: theme === 'white' ? '#64748b' : '#888', marginBottom: '8px' }}>Р”РµР»РёС‚РµР»СЊ РїР»РѕС‰Р°РґРё РЅР° 1 СЃРєРІР°Р¶РёРЅСѓ</label>
                      <input 
                        type="number" 
                        value={adminData.calc?.holeAreaDivisor || 120} 
                        onChange={e => setAdminData(prev => ({...prev, calc: {...prev.calc, holeAreaDivisor: Number(e.target.value)}}))}
                        style={{ padding: '12px', borderRadius: '8px', border: theme === 'white' ? '1px solid #cbd5e1' : '1px solid #333', background: theme === 'white' ? '#fff' : '#000', color: theme === 'white' ? '#0f172a' : '#fff' }} 
                      />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <label style={{ fontSize: '0.85rem', color: theme === 'white' ? '#64748b' : '#888', marginBottom: '8px' }}>РЎРєРѕСЂРѕСЃС‚СЊ Р±СѓСЂРµРЅРёСЏ (РїРѕРі.Рј/РґРµРЅСЊ)</label>
                      <input 
                        type="number" 
                        value={adminData.calc?.drillSpeedPerDay || 22} 
                        onChange={e => setAdminData(prev => ({...prev, calc: {...prev.calc, drillSpeedPerDay: Number(e.target.value)}}))}
                        style={{ padding: '12px', borderRadius: '8px', border: theme === 'white' ? '1px solid #cbd5e1' : '1px solid #333', background: theme === 'white' ? '#fff' : '#000', color: theme === 'white' ? '#0f172a' : '#fff' }} 
                      />
                    </div>
                  </div>
                  <h4 style={{ fontSize: '1.2rem', fontWeight: 'bold', marginTop: '40px', marginBottom: '20px', color: theme === 'white' ? '#0f172a' : '#fff' }}>РЎС‚РѕРёРјРѕСЃС‚СЊ Р±СѓСЂРµРЅРёСЏ РїРѕ С‚РёРїР°Рј РіСЂСѓРЅС‚РѕРІ (в‚ё/РїРѕРі.Рј)</h4>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <label style={{ fontSize: '0.85rem', color: theme === 'white' ? '#64748b' : '#888', marginBottom: '8px' }}>РџРµСЃРєРё</label>
                      <input 
                        type="number"
                        value={adminData.calc?.soilSandPrice || 18500} 
                        onChange={e => setAdminData(prev => ({...prev, calc: {...prev.calc, soilSandPrice: Number(e.target.value)}}))}
                        style={{ padding: '12px', borderRadius: '8px', border: theme === 'white' ? '1px solid #cbd5e1' : '1px solid #333', background: theme === 'white' ? '#fff' : '#000', color: theme === 'white' ? '#0f172a' : '#fff' }} 
                      />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <label style={{ fontSize: '0.85rem', color: theme === 'white' ? '#64748b' : '#888', marginBottom: '8px' }}>Р“Р»РёРЅС‹</label>
                      <input 
                        type="number"
                        value={adminData.calc?.soilClayPrice || 22200} 
                        onChange={e => setAdminData(prev => ({...prev, calc: {...prev.calc, soilClayPrice: Number(e.target.value)}}))}
                        style={{ padding: '12px', borderRadius: '8px', border: theme === 'white' ? '1px solid #cbd5e1' : '1px solid #333', background: theme === 'white' ? '#fff' : '#000', color: theme === 'white' ? '#0f172a' : '#fff' }} 
                      />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <label style={{ fontSize: '0.85rem', color: theme === 'white' ? '#64748b' : '#888', marginBottom: '8px' }}>РЎСѓРіР»РёРЅРєРё</label>
                      <input 
                        type="number"
                        value={adminData.calc?.soilLoamPrice || 20350} 
                        onChange={e => setAdminData(prev => ({...prev, calc: {...prev.calc, soilLoamPrice: Number(e.target.value)}}))}
                        style={{ padding: '12px', borderRadius: '8px', border: theme === 'white' ? '1px solid #cbd5e1' : '1px solid #333', background: theme === 'white' ? '#fff' : '#000', color: theme === 'white' ? '#0f172a' : '#fff' }} 
                      />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <label style={{ fontSize: '0.85rem', color: theme === 'white' ? '#64748b' : '#888', marginBottom: '8px' }}>РЎРєР°Р»Р°</label>
                      <input 
                        type="number"
                        value={adminData.calc?.soilRockPrice || 46250} 
                        onChange={e => setAdminData(prev => ({...prev, calc: {...prev.calc, soilRockPrice: Number(e.target.value)}}))}
                        style={{ padding: '12px', borderRadius: '8px', border: theme === 'white' ? '1px solid #cbd5e1' : '1px solid #333', background: theme === 'white' ? '#fff' : '#000', color: theme === 'white' ? '#0f172a' : '#fff' }} 
                      />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <label style={{ fontSize: '0.85rem', color: theme === 'white' ? '#64748b' : '#888', marginBottom: '8px' }}>РўРѕСЂС„</label>
                      <input 
                        type="number"
                        value={adminData.calc?.soilPeatPrice || 27750} 
                        onChange={e => setAdminData(prev => ({...prev, calc: {...prev.calc, soilPeatPrice: Number(e.target.value)}}))}
                        style={{ padding: '12px', borderRadius: '8px', border: theme === 'white' ? '1px solid #cbd5e1' : '1px solid #333', background: theme === 'white' ? '#fff' : '#000', color: theme === 'white' ? '#0f172a' : '#fff' }} 
                      />
                    </div>
                  </div>

                  <div style={{ marginTop: '30px', paddingTop: '20px', borderTop: theme === 'white' ? '1px solid #e2e8f0' : '1px solid #333', display: 'flex', justifyContent: 'flex-end' }}>
                    <button onClick={() => {
                      localStorage.setItem('spengeo_admin_data', JSON.stringify(adminData));
                      logEvent('РќР°СЃС‚СЂРѕР№РєРё РєР°Р»СЊРєСѓР»СЏС‚РѕСЂР° СЃРѕС…СЂР°РЅРµРЅС‹', 'success');
                      alert('РЎРѕС…СЂР°РЅРµРЅРѕ!');
                    }} style={{ background: '#f59e0b', color: '#fff', border: 'none', padding: '12px 30px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
                      РЎРѕС…СЂР°РЅРёС‚СЊ РЅР°СЃС‚СЂРѕР№РєРё
                    </button>
                  </div>
                </div>
              )}

              {/* ===== ADMIN SUB-PAGES ===== */}

              {activeAdminSection === 'form_knowledge_articles' && (
                <div style={{ background: theme === 'white' ? '#fff' : '#111', border: theme === 'white' ? '1px solid rgba(0,0,0,0.05)' : '1px solid rgba(255,255,255,0.05)', borderRadius: '12px', padding: '30px', boxShadow: theme === 'white' ? '0 4px 20px rgba(0,0,0,0.05)' : 'none' }}>
                  <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '30px', color: theme === 'white' ? '#0f172a' : '#fff', borderBottom: theme === 'white' ? '1px solid #e2e8f0' : '1px solid #333', paddingBottom: '15px' }}>РЈРїСЂР°РІР»РµРЅРёРµ Р‘Р°Р·РѕР№ Р—РЅР°РЅРёР№: РЎС‚Р°С‚СЊРё</h3>
                  
                  <div style={{ marginBottom: '40px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ background: 'rgba(6, 182, 212, 0.1)', padding: '8px', borderRadius: '8px', color: '#06b6d4' }}><BookOpen size={20} /></div>
                        <h4 style={{ color: theme === 'white' ? '#0f172a' : '#fff', fontSize: '1.2rem', margin: 0 }}>РЎС‚Р°С‚СЊРё</h4>
                      </div>
                      <button onClick={() => setAdminData({...adminData, articles: [{id: Date.now().toString(), title: 'РќРѕРІР°СЏ СЃС‚Р°С‚СЊСЏ', category: 'РЎС‚Р°С‚СЊСЏ', date: new Date().toISOString().split('T')[0], readTime: '5 РјРёРЅ', excerpt: '', content: '', image: ''}, ...adminData.articles]})} style={{ background: '#06b6d4', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>+ Р”РѕР±Р°РІРёС‚СЊ СЃС‚Р°С‚СЊСЋ</button>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '20px' }}>
                      {(adminData.articles || []).map((article, i) => (
                        <div key={i} style={{ background: theme === 'white' ? '#f8fafc' : '#1a1a1a', border: theme === 'white' ? '1px solid #e2e8f0' : '1px solid #333', borderRadius: '12px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: '0.85rem', color: theme === 'white' ? '#64748b' : '#888' }}>РЎС‚Р°С‚СЊСЏ #{i+1}</span>
                            <button onClick={() => {
                              const newArr = [...adminData.articles];
                              newArr.splice(i, 1);
                              setAdminData({...adminData, articles: newArr});
                            }} style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: 'none', padding: '6px', borderRadius: '6px', cursor: 'pointer' }}><Trash2 size={14}/></button>
                          </div>
                          
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                              <div>
                                  <div style={{ fontSize: '0.75rem', color: theme === 'white' ? '#64748b' : '#888', marginBottom: '5px' }}>Р—Р°РіРѕР»РѕРІРѕРє</div>
                                  <input type="text" value={article.title} onChange={e => {
                                    const newArr = [...adminData.articles];
                                    newArr[i].title = e.target.value;
                                    setAdminData({...adminData, articles: newArr});
                                  }} style={{ width: '100%', padding: '10px', background: theme === 'white' ? '#fff' : '#000', border: theme === 'white' ? '1px solid #cbd5e1' : '1px solid #444', color: theme === 'white' ? '#0f172a' : '#fff', borderRadius: '6px' }} />
                              </div>
                              <div>
                                  <div style={{ fontSize: '0.75rem', color: theme === 'white' ? '#64748b' : '#888', marginBottom: '5px' }}>РљР°С‚РµРіРѕСЂРёСЏ</div>
                                  <input type="text" value={article.category} onChange={e => {
                                    const newArr = [...adminData.articles];
                                    newArr[i].category = e.target.value;
                                    setAdminData({...adminData, articles: newArr});
                                  }} style={{ width: '100%', padding: '10px', background: theme === 'white' ? '#fff' : '#000', border: theme === 'white' ? '1px solid #cbd5e1' : '1px solid #444', color: theme === 'white' ? '#0f172a' : '#fff', borderRadius: '6px' }} />
                              </div>
                          </div>
                          
                          <div>
                            <div style={{ fontSize: '0.75rem', color: theme === 'white' ? '#64748b' : '#888', marginBottom: '5px' }}>Р¤РѕС‚РѕРіСЂР°С„РёСЏ (РѕР±Р»РѕР¶РєР°)</div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                              {article.image && <img src={article.image} alt={article.title} style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '6px' }} />}
                              <label style={{ padding: '8px 12px', background: 'rgba(6, 182, 212, 0.1)', color: '#06b6d4', border: 'none', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 'bold' }}>
                                <Folder size={14}/> РЎ СѓСЃС‚СЂРѕР№СЃС‚РІР°
                                <input type="file" accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt,.csv,.zip,.rar" style={{ display: 'none' }} onChange={(e) => {
                                    const file = e.target.files[0];
                                    if (file) {
                                        uploadFileToServer(file).then(url => {
                                            if (url) {
                                                const newArr = [...adminData.articles];
                                                newArr[i].image = url;
                                                setAdminData({...adminData, articles: newArr});
                                            }
                                        });
                                    }
                                }} />
                              </label>
                              <input type="text" value={article.image || ''} onChange={(e) => {
                                  const newArr = [...adminData.articles];
                                  newArr[i].image = e.target.value;
                                  setAdminData({...adminData, articles: newArr});
                              }} placeholder="РР»Рё РІСЃС‚Р°РІСЊС‚Рµ URL..." style={{ flex: 1, padding: '10px', background: theme === 'white' ? '#fff' : '#000', border: theme === 'white' ? '1px solid #cbd5e1' : '1px solid #444', color: theme === 'white' ? '#0f172a' : '#fff', borderRadius: '6px' }} />
                            </div>
                          </div>

                          <div>
                            <div style={{ fontSize: '0.75rem', color: theme === 'white' ? '#64748b' : '#888', marginBottom: '5px' }}>РљСЂР°С‚РєРѕРµ РѕРїРёСЃР°РЅРёРµ (excerpt)</div>
                            <textarea value={article.excerpt} onChange={e => {
                              const newArr = [...adminData.articles];
                              newArr[i].excerpt = e.target.value;
                              setAdminData({...adminData, articles: newArr});
                            }} rows={2} style={{ width: '100%', padding: '10px', background: theme === 'white' ? '#fff' : '#000', border: theme === 'white' ? '1px solid #cbd5e1' : '1px solid #444', color: theme === 'white' ? '#0f172a' : '#fff', borderRadius: '6px', fontFamily: 'inherit' }} />
                          </div>
                          
                          <div>
                            <div style={{ fontSize: '0.75rem', color: theme === 'white' ? '#64748b' : '#888', marginBottom: '5px' }}>РџРѕР»РЅС‹Р№ С‚РµРєСЃС‚ (content)</div>
                            <textarea value={article.content} onChange={e => {
                              const newArr = [...adminData.articles];
                              newArr[i].content = e.target.value;
                              setAdminData({...adminData, articles: newArr});
                            }} rows={5} style={{ width: '100%', padding: '10px', background: theme === 'white' ? '#fff' : '#000', border: theme === 'white' ? '1px solid #cbd5e1' : '1px solid #444', color: theme === 'white' ? '#0f172a' : '#fff', borderRadius: '6px', fontFamily: 'inherit' }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}


              
                            {activeAdminSection.startsWith('form_') && activeAdminSection !== 'form_knowledge_articles' && (() => {
                const sectionKey = activeAdminSection.replace('form_', '');
                
                const DYNAMIC_FORM_CONFIGS = {
                  'services': { title: 'РЈСЃР»СѓРіРё', addText: 'Р”РѕР±Р°РІРёС‚СЊ СѓСЃР»СѓРіСѓ', fields: [{ key: 'code', label: 'РљРѕРґ СѓСЃР»СѓРіРё', type: 'text' }, { key: 'title', label: 'РќР°Р·РІР°РЅРёРµ СѓСЃР»СѓРіРё', type: 'text' }] },
                  'about_history': { title: 'РСЃС‚РѕСЂРёСЏ (РўР°Р№РјР»Р°Р№РЅ)', addText: 'Р”РѕР±Р°РІРёС‚СЊ СЌС‚Р°Рї', fields: [{ key: 'title', label: 'Р“РѕРґ / РџРµСЂРёРѕРґ', type: 'text' }, { key: 'desc', label: 'РћРїРёСЃР°РЅРёРµ СЃРѕР±С‹С‚РёСЏ', type: 'textarea' }] },
                  'about_advantages': { title: 'РќР°С€Рё РїСЂРµРёРјСѓС‰РµСЃС‚РІР°', addText: 'Р”РѕР±Р°РІРёС‚СЊ РїСЂРµРёРјСѓС‰РµСЃС‚РІРѕ', fields: [{ key: 'title', label: 'РќР°Р·РІР°РЅРёРµ РїСЂРµРёРјСѓС‰РµСЃС‚РІР°', type: 'text' }, { key: 'desc', label: 'РћРїРёСЃР°РЅРёРµ', type: 'textarea' }, { key: 'image', label: 'РРєРѕРЅРєР° (lucide name РёР»Рё URL)', type: 'text' }] },
                  'about_team': { title: 'РљРѕРјР°РЅРґР°', addText: 'Р”РѕР±Р°РІРёС‚СЊ СЃРѕС‚СЂСѓРґРЅРёРєР°', fields: [{ key: 'name', label: 'Р¤РРћ', type: 'text' }, { key: 'position', label: 'Р”РѕР»Р¶РЅРѕСЃС‚СЊ', type: 'text' }, { key: 'desc', label: 'РћРїРёСЃР°РЅРёРµ', type: 'textarea' }, { key: 'image', label: 'Р¤РѕС‚Рѕ (URL)', type: 'text' }] },
                  'about_career': { title: 'Р’Р°РєР°РЅСЃРёРё', addText: 'Р”РѕР±Р°РІРёС‚СЊ РІР°РєР°РЅСЃРёСЋ', fields: [{ key: 'title', label: 'Р”РѕР»Р¶РЅРѕСЃС‚СЊ', type: 'text' }, { key: 'coeff', label: 'Р“СЂР°С„РёРє / РЈСЃР»РѕРІРёСЏ', type: 'text' }, { key: 'desc', label: 'РўСЂРµР±РѕРІР°РЅРёСЏ', type: 'textarea' }] },
                  'about_documents': { title: 'Р›РёС†РµРЅР·РёРё Рё СЃРµСЂС‚РёС„РёРєР°С‚С‹', addText: 'Р”РѕР±Р°РІРёС‚СЊ РґРѕРєСѓРјРµРЅС‚', fields: [{ key: 'title', label: 'РќР°Р·РІР°РЅРёРµ РґРѕРєСѓРјРµРЅС‚Р°', type: 'text' }, { key: 'image', label: 'РЎСЃС‹Р»РєР° РЅР° РґРѕРєСѓРјРµРЅС‚ (URL)', type: 'text' }] },
                  
                  // Blog / Knowledge Base
                  'blog_articles': { title: 'РЎС‚Р°С‚СЊРё', addText: 'Р”РѕР±Р°РІРёС‚СЊ СЃС‚Р°С‚СЊСЋ', fields: [{ key: 'title', label: 'Р—Р°РіРѕР»РѕРІРѕРє', type: 'text' }, { key: 'date', label: 'Р”Р°С‚Р°', type: 'text' }, { key: 'category', label: 'РљР°С‚РµРіРѕСЂРёСЏ', type: 'text' }, { key: 'desc', label: 'РљСЂР°С‚РєРѕРµ СЃРѕРґРµСЂР¶Р°РЅРёРµ', type: 'textarea' }, { key: 'image', label: 'РР·РѕР±СЂР°Р¶РµРЅРёРµ (URL)', type: 'text' }] },
                  'blog_faq': { title: 'FAQ (Р’РѕРїСЂРѕСЃС‹)', addText: 'Р”РѕР±Р°РІРёС‚СЊ РІРѕРїСЂРѕСЃ', fields: [{ key: 'question', label: 'Р’РѕРїСЂРѕСЃ', type: 'text' }, { key: 'answer', label: 'РћС‚РІРµС‚', type: 'textarea' }] },
                  'blog_methods': { title: 'РњРµС‚РѕРґС‹ РёСЃРїС‹С‚Р°РЅРёР№', addText: 'Р”РѕР±Р°РІРёС‚СЊ РјРµС‚РѕРґ', fields: [{ key: 'title', label: 'РќР°Р·РІР°РЅРёРµ', type: 'text' }, { key: 'desc', label: 'РћРїРёСЃР°РЅРёРµ', type: 'textarea' }] },
                  'blog_soils': { title: 'РўРёРїС‹ РіСЂСѓРЅС‚РѕРІ', addText: 'Р”РѕР±Р°РІРёС‚СЊ РіСЂСѓРЅС‚', fields: [{ key: 'title', label: 'РќР°Р·РІР°РЅРёРµ РіСЂСѓРЅС‚Р°', type: 'text' }, { key: 'desc', label: 'РћРїРёСЃР°РЅРёРµ', type: 'textarea' }] },
                  'blog_norms': { title: 'РќРѕСЂРјР°С‚РёРІРЅС‹Рµ РґРѕРєСѓРјРµРЅС‚С‹', addText: 'Р”РѕР±Р°РІРёС‚СЊ РЅРѕСЂРјР°С‚РёРІ', fields: [{ key: 'title', label: 'РЁРёС„СЂ', type: 'text' }, { key: 'desc', label: 'РћРїРёСЃР°РЅРёРµ', type: 'text' }] },
                  'blog_news': { title: 'РќРѕРІРѕСЃС‚Рё', addText: 'Р”РѕР±Р°РІРёС‚СЊ РЅРѕРІРѕСЃС‚СЊ', fields: [{ key: 'title', label: 'Р—Р°РіРѕР»РѕРІРѕРє', type: 'text' }, { key: 'date', label: 'Р”Р°С‚Р°', type: 'text' }, { key: 'desc', label: 'РўРµРєСЃС‚', type: 'textarea' }] },
                  'blog_photos': { title: 'Р¤РѕС‚Рѕ', addText: 'Р”РѕР±Р°РІРёС‚СЊ С„РѕС‚Рѕ', fields: [{ key: 'title', label: 'РџРѕРґРїРёСЃСЊ', type: 'text' }, { key: 'image', label: 'РЎСЃС‹Р»РєР° РЅР° С„РѕС‚Рѕ (URL)', type: 'text' }] },
                  'blog_videos': { title: 'Р’РёРґРµРѕ', addText: 'Р”РѕР±Р°РІРёС‚СЊ РІРёРґРµРѕ', fields: [{ key: 'title', label: 'РџРѕРґРїРёСЃСЊ', type: 'text' }, { key: 'image', label: 'РЎСЃС‹Р»РєР° РЅР° РІРёРґРµРѕ (URL)', type: 'text' }] },

                  // Equipment
                  'equipment_rigs_0': { title: 'Р‘СѓСЂРѕРІС‹Рµ СѓСЃС‚Р°РЅРѕРІРєРё', addText: 'Р”РѕР±Р°РІРёС‚СЊ СѓСЃС‚Р°РЅРѕРІРєСѓ', fields: [{ key: 'name', label: 'РќР°Р·РІР°РЅРёРµ', type: 'text' }, { key: 'type', label: 'РўРёРї', type: 'text' }, { key: 'maxDepth', label: 'Р“Р»СѓР±РёРЅР° Р±СѓСЂРµРЅРёСЏ', type: 'text' }, { key: 'torque', label: 'РљСЂСѓС‚СЏС‰РёР№ РјРѕРјРµРЅС‚', type: 'text' }, { key: 'weight', label: 'РњР°СЃСЃР° СѓСЃС‚Р°РЅРѕРІРєРё', type: 'text' }, { key: 'mobility', label: 'РўСЂР°РЅСЃРїРѕСЂС‚РёСЂРѕРІРєР°', type: 'text' }, { key: 'description', label: 'РћРїРёСЃР°РЅРёРµ', type: 'textarea' }, { key: 'soilType', label: 'РўРёРїС‹ РіСЂСѓРЅС‚РѕРІ', type: 'text' }, { key: 'cadSpecs', label: 'CAD-РЎРїРµС†РёС„РёРєР°С†РёРё (С‡РµСЂРµР· Р·Р°РїСЏС‚СѓСЋ)', type: 'text' }] },
                  'equipment_rigs_1': { title: 'РђРІС‚РѕС‚СЂР°РЅСЃРїРѕСЂС‚', addText: 'Р”РѕР±Р°РІРёС‚СЊ Р°РІС‚Рѕ', fields: [{ key: 'name', label: 'РњР°СЂРєР°/РњРѕРґРµР»СЊ', type: 'text' }, { key: 'type', label: 'РўРёРї', type: 'text' }, { key: 'description', label: 'РћРїРёСЃР°РЅРёРµ', type: 'textarea' }] },
                  'equipment_lab_0': { title: 'CPT / Р—РѕРЅРґРёСЂРѕРІР°РЅРёРµ', addText: 'Р”РѕР±Р°РІРёС‚СЊ РїСЂРёР±РѕСЂ', fields: [{ key: 'name', label: 'РќР°Р·РІР°РЅРёРµ', type: 'text' }, { key: 'type', label: 'РўРёРї', type: 'text' }, { key: 'description', label: 'РћРїРёСЃР°РЅРёРµ', type: 'textarea' }] },
                  'equipment_lab_1': { title: 'РСЃРїС‹С‚Р°С‚РµР»СЊРЅРѕРµ РѕР±РѕСЂСѓРґРѕРІР°РЅРёРµ', addText: 'Р”РѕР±Р°РІРёС‚СЊ РїСЂРёР±РѕСЂ', fields: [{ key: 'name', label: 'РќР°Р·РІР°РЅРёРµ', type: 'text' }, { key: 'type', label: 'РўРёРї', type: 'text' }, { key: 'description', label: 'РћРїРёСЃР°РЅРёРµ', type: 'textarea' }] },
                  'equipment_lab_2': { title: 'Р›Р°Р±РѕСЂР°С‚РѕСЂРёСЏ / Р“РµРѕРґРµР·РёСЏ', addText: 'Р”РѕР±Р°РІРёС‚СЊ РїСЂРёР±РѕСЂ', fields: [{ key: 'name', label: 'РќР°Р·РІР°РЅРёРµ', type: 'text', required: true }, { key: 'type', label: 'РўРёРї', type: 'text' }, { key: 'params', label: 'РџР°СЂР°РјРµС‚СЂС‹ РёСЃРїС‹С‚Р°РЅРёР№', type: 'text' }, { key: 'purpose', label: 'Р¦РµР»РµРІС‹Рµ СЃРІРѕР№СЃС‚РІР°', type: 'text' }, { key: 'standard', label: 'Р“РћРЎРў / Р РµРіР»Р°РјРµРЅС‚', type: 'text' }, { key: 'description', label: 'РћРїРёСЃР°РЅРёРµ', type: 'textarea' }, { key: 'cadSpecs', label: 'CAD-РЎРїРµС†РёС„РёРєР°С†РёРё (С‡РµСЂРµР· Р·Р°РїСЏС‚СѓСЋ)', type: 'text' }] }
                };

                const isDocLike = (() => {
                   if (!activeAdminSection.startsWith('form_about_')) return false;
                   const subId = activeAdminSection.replace('form_about_', '');
                   const menuMatch = dynamicMenu['ru'].find(m => m.page === 'about')?.items?.find(s => s.action.subpage === subId);
                   return menuMatch && (menuMatch.name.toLowerCase().includes('Р»РёС†РµРЅР·') || menuMatch.name.toLowerCase().includes('СЃРµСЂС‚РёС„') || menuMatch.name.toLowerCase().includes('РґРѕРєСѓРјРµРЅС‚'));
                })();

                const config = DYNAMIC_FORM_CONFIGS[sectionKey] || {
                    title: isDocLike ? 'РЈРїСЂР°РІР»РµРЅРёРµ РґРѕРєСѓРјРµРЅС‚Р°РјРё' : 'РЈРїСЂР°РІР»РµРЅРёРµ Р·Р°РїРёСЃСЏРјРё',
                    addText: isDocLike ? 'Р”РѕР±Р°РІРёС‚СЊ РґРѕРєСѓРјРµРЅС‚' : 'Р”РѕР±Р°РІРёС‚СЊ Р·Р°РїРёСЃСЊ',
                    fields: isDocLike ? [
                        { key: 'title', label: 'РќР°Р·РІР°РЅРёРµ РґРѕРєСѓРјРµРЅС‚Р°', type: 'text' },
                        { key: 'image', label: 'РЎСЃС‹Р»РєР° РЅР° РґРѕРєСѓРјРµРЅС‚ (URL)', type: 'text' }
                    ] : [
                        { key: 'title', label: 'РќР°Р·РІР°РЅРёРµ', type: 'text' },
                        { key: 'desc', label: 'РћРїРёСЃР°РЅРёРµ', type: 'textarea' },
                        { key: 'image', label: 'Р¤РѕС‚Рѕ/РЎСЃС‹Р»РєР° (URL)', type: 'text' }
                    ]
                };

                return (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
                  {sectionKey === 'about_history' && (
                    <div style={{ background: theme === 'white' ? '#fff' : '#111', border: theme === 'white' ? '1px solid rgba(0,0,0,0.05)' : '1px solid rgba(255,255,255,0.05)', borderRadius: '12px', padding: '30px', boxShadow: theme === 'white' ? '0 4px 20px rgba(0,0,0,0.05)' : 'none' }}>
                      <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '10px', color: theme === 'white' ? '#0f172a' : '#fff' }}>РљР°СЂС‚РѕС‡РєР° РћСЃРЅРѕРІР°С‚РµР»СЏ</h3>
                      <p style={{ fontSize: '0.9rem', color: theme === 'white' ? '#64748b' : '#888', marginBottom: '30px' }}>Р”Р°РЅРЅС‹Рµ РѕСЃРЅРѕРІР°С‚РµР»СЏ, РѕС‚РѕР±СЂР°Р¶Р°РµРјС‹Рµ РЅР° СЃС‚СЂР°РЅРёС†Рµ РёСЃС‚РѕСЂРёРё Рё РЅР° РіР»Р°РІРЅРѕР№.</p>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '800px' }}>
                        <div>
                          <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 'bold', color: theme === 'white' ? '#0f172a' : '#fff', marginBottom: '8px' }}>Р¤РѕС‚РѕРіСЂР°С„РёСЏ</label>
                          <ImageUploadField 
                            value={adminData.media?.historyDirectorImage || '/images/director.png'} 
                            onChange={v => {
                              setAdminData(prev => ({
                                ...prev,
                                media: { ...(prev.media || {}), historyDirectorImage: v }
                              }));
                            }} 
                            theme={theme} 
                          />
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                          <div>
                            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 'bold', color: theme === 'white' ? '#0f172a' : '#fff', marginBottom: '8px' }}>РРјСЏ</label>
                            <input 
                              type="text" 
                              value={adminData.visualTexts?.['history_f_name'] || ''} 
                              onChange={(e) => {
                                const val = e.target.value;
                                setAdminData(prev => ({
                                  ...prev,
                                  visualTexts: { ...(prev.visualTexts || {}), history_f_name: val }
                                }));
                                if (typeof localStorage !== 'undefined') localStorage.setItem('vb_history_f_name', val);
                                window.dispatchEvent(new CustomEvent('vb_update', { detail: { id: 'history_f_name', text: val } }));
                              }} 
                              style={{ width: '100%', padding: '12px', background: theme === 'white' ? '#f8fafc' : '#000', border: theme === 'white' ? '1px solid #cbd5e1' : '1px solid #444', color: theme === 'white' ? '#0f172a' : '#fff', borderRadius: '8px' }} 
                            />
                          </div>
                          <div>
                            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 'bold', color: theme === 'white' ? '#0f172a' : '#fff', marginBottom: '8px' }}>РћС‚С‡РµСЃС‚РІРѕ / Р¤Р°РјРёР»РёСЏ</label>
                            <input 
                              type="text" 
                              value={adminData.visualTexts?.['history_f_patr'] || ''} 
                              onChange={(e) => {
                                const val = e.target.value;
                                setAdminData(prev => ({
                                  ...prev,
                                  visualTexts: { ...(prev.visualTexts || {}), history_f_patr: val }
                                }));
                                if (typeof localStorage !== 'undefined') localStorage.setItem('vb_history_f_patr', val);
                                window.dispatchEvent(new CustomEvent('vb_update', { detail: { id: 'history_f_patr', text: val } }));
                              }} 
                              style={{ width: '100%', padding: '12px', background: theme === 'white' ? '#f8fafc' : '#000', border: theme === 'white' ? '1px solid #cbd5e1' : '1px solid #444', color: theme === 'white' ? '#0f172a' : '#fff', borderRadius: '8px' }} 
                            />
                          </div>
                        </div>
                        <div>
                          <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 'bold', color: theme === 'white' ? '#0f172a' : '#fff', marginBottom: '8px' }}>Р”РѕР»Р¶РЅРѕСЃС‚СЊ</label>
                          <input 
                            type="text" 
                            value={adminData.visualTexts?.['history_f_role'] || ''} 
                            onChange={(e) => {
                              const val = e.target.value;
                              setAdminData(prev => ({
                                ...prev,
                                visualTexts: { ...(prev.visualTexts || {}), history_f_role: val }
                              }));
                              if (typeof localStorage !== 'undefined') localStorage.setItem('vb_history_f_role', val);
                              window.dispatchEvent(new CustomEvent('vb_update', { detail: { id: 'history_f_role', text: val } }));
                            }} 
                            style={{ width: '100%', padding: '12px', background: theme === 'white' ? '#f8fafc' : '#000', border: theme === 'white' ? '1px solid #cbd5e1' : '1px solid #444', color: theme === 'white' ? '#0f172a' : '#fff', borderRadius: '8px' }} 
                          />
                        </div>
                        <div>
                          <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 'bold', color: theme === 'white' ? '#0f172a' : '#fff', marginBottom: '8px' }}>РўРµРєСЃС‚ (Р¦РёС‚Р°С‚Р°/РСЃС‚РѕСЂРёСЏ)</label>
                          <textarea 
                            value={adminData.visualTexts?.['history_f_quote'] || ''} 
                            onChange={(e) => {
                              const val = e.target.value;
                              setAdminData(prev => ({
                                ...prev,
                                visualTexts: { ...(prev.visualTexts || {}), history_f_quote: val }
                              }));
                              if (typeof localStorage !== 'undefined') localStorage.setItem('vb_history_f_quote', val);
                              window.dispatchEvent(new CustomEvent('vb_update', { detail: { id: 'history_f_quote', text: val } }));
                            }} 
                            rows={4}
                            style={{ width: '100%', padding: '12px', background: theme === 'white' ? '#f8fafc' : '#000', border: theme === 'white' ? '1px solid #cbd5e1' : '1px solid #444', color: theme === 'white' ? '#0f172a' : '#fff', borderRadius: '8px', fontFamily: 'inherit' }} 
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* --- SPECIFIC LIST EDITOR --- */}
                  <div style={{ background: theme === 'white' ? '#fff' : '#111', border: theme === 'white' ? '1px solid rgba(0,0,0,0.05)' : '1px solid rgba(255,255,255,0.05)', borderRadius: '12px', padding: '30px', boxShadow: theme === 'white' ? '0 4px 20px rgba(0,0,0,0.05)' : 'none' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', borderBottom: theme === 'white' ? '1px solid #e2e8f0' : '1px solid #333', paddingBottom: '15px' }}>
                       <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: theme === 'white' ? '#0f172a' : '#fff', margin: 0 }}>Р‘Р”: {config.title}</h3>
                       <button onClick={() => {
                          const currentList = adminData.dynamicLists?.[sectionKey] || [];
                          const newList = [{ id: Date.now().toString(), title: '', desc: '', image: '', coeff: '' }, ...currentList];
                          setAdminData({ ...adminData, dynamicLists: { ...(adminData.dynamicLists || {}), [sectionKey]: newList } });
                       }} style={{ background: '#3b82f6', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>+ {config.addText}</button>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
                       {((adminData.dynamicLists || {})[sectionKey] || []).map((item, idx) => (
                          <div key={item.id} style={{ padding: '20px', border: theme === 'white' ? '1px solid #e2e8f0' : '1px solid #333', borderRadius: '12px', background: theme === 'white' ? '#f8fafc' : '#1a1a1a', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                             <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ fontSize: '0.85rem', color: theme === 'white' ? '#64748b' : '#888', fontWeight: 'bold' }}>Р—Р°РїРёСЃСЊ #{idx+1}</span>
                                <button onClick={() => {
                                   const currentList = adminData.dynamicLists[sectionKey];
                                   const newList = currentList.filter((_, i) => i !== idx);
                                   setAdminData({ ...adminData, dynamicLists: { ...adminData.dynamicLists, [sectionKey]: newList } });
                                }} style={{ color: '#ef4444', background: 'rgba(239, 68, 68, 0.1)', padding: '6px', borderRadius: '6px', border: 'none', cursor: 'pointer' }}><Trash2 size={16}/></button>
                             </div>
                             
                             {config.fields.map(field => (
                               <div key={field.key}>
                                  <label style={{ display: 'block', fontSize: '0.8rem', marginBottom: '6px', color: theme === 'white' ? '#64748b' : '#888', fontWeight: '600' }}>{field.label}</label>
                                  {field.type === 'textarea' ? (
                                     <textarea value={item[field.key] || ''} onChange={(e) => {
                                         const newList = [...adminData.dynamicLists[sectionKey]];
                                         newList[idx][field.key] = e.target.value;
                                         setAdminData({ ...adminData, dynamicLists: { ...adminData.dynamicLists, [sectionKey]: newList } });
                                     }} rows={3} style={{ width: '100%', padding: '10px', background: theme === 'white' ? '#fff' : '#000', border: theme === 'white' ? '1px solid #cbd5e1' : '1px solid #444', color: theme === 'white' ? '#0f172a' : '#fff', borderRadius: '8px', fontFamily: 'inherit' }} />
                                  ) : (field.key === 'image' || field.label.toLowerCase().includes('СЃСЃС‹Р»РєР°') || field.label.toLowerCase().includes('СЃРєР°РЅ') || field.label.toLowerCase().includes('С„РѕС‚Рѕ') || field.label.toLowerCase().includes('РІРёРґРµРѕ')) ? (
                                     <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                        {item[field.key] && (item[field.key].startsWith('data:image/') || item[field.key].match(/\.(jpeg|jpg|gif|png)$/) || item[field.key].startsWith('blob:')) && (
                                            <div style={{ height: '100px', width: 'fit-content', borderRadius: '8px', overflow: 'hidden', border: theme === 'white' ? '1px solid #cbd5e1' : '1px solid #444', background: theme === 'white' ? '#f8fafc' : '#000' }}>
                                                <img src={item[field.key]} style={{ height: '100%', objectFit: 'contain' }} alt="Preview" onError={(e) => e.target.style.display = 'none'} />
                                            </div>
                                        )}
                                        {item[field.key] && (item[field.key].startsWith('data:video/') || item[field.key].match(/\.(mp4|webm|ogg)$/i) || item[field.key].includes('youtube.com') || item[field.key].includes('youtu.be')) && (
                                            <div style={{ height: '100px', width: 'fit-content', borderRadius: '8px', overflow: 'hidden', border: theme === 'white' ? '1px solid #cbd5e1' : '1px solid #444', background: theme === 'white' ? '#f8fafc' : '#000' }}>
                                                {item[field.key].includes('youtu') ? (
                                                  <iframe src={item[field.key].replace('watch?v=', 'embed/').replace('youtu.be/', 'youtube.com/embed/')} style={{ height: '100%', border: 'none' }} allowFullScreen />
                                                ) : (
                                                  <video src={item[field.key]} style={{ height: '100%' }} controls playsInline webkit-playsinline="true" preload="auto" />
                                                )}
                                            </div>
                                        )}
                                        <div style={{ display: 'flex', gap: '10px' }}>
                                            <input placeholder="Р’СЃС‚Р°РІСЊС‚Рµ URL РёР»Рё Р·Р°РіСЂСѓР·РёС‚Рµ С„Р°Р№Р»..." value={item[field.key]?.length > 200 ? item[field.key].substring(0, 30) + '... (С„Р°Р№Р» Р·Р°РіСЂСѓР¶РµРЅ)' : (item[field.key] || '')} onChange={(e) => {
                                                const newList = [...adminData.dynamicLists[sectionKey]];
                                                newList[idx][field.key] = e.target.value;
                                                setAdminData({ ...adminData, dynamicLists: { ...adminData.dynamicLists, [sectionKey]: newList } });
                                            }} style={{ flex: 1, padding: '10px', background: theme === 'white' ? '#fff' : '#000', border: theme === 'white' ? '1px solid #cbd5e1' : '1px solid #444', color: theme === 'white' ? '#0f172a' : '#fff', borderRadius: '8px' }} />
                                            <label style={{ background: '#3b82f6', color: '#fff', padding: '0 15px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '0.85rem', flexShrink: 0 }}>
                                           РЎ СѓСЃС‚СЂРѕР№СЃС‚РІР°
                                           <input type="file" accept="image/*,video/*,.pdf,.doc,.docx,.xls,.xlsx,.txt,.csv,.zip,.rar" style={{ display: 'none' }} onChange={(e) => {
                                               const file = e.target.files[0];
                                               if (file) {
                                                   uploadFileToServer(file).then(url => {
                                                       if (url) {
                                                           const newList = [...adminData.dynamicLists[sectionKey]];
                                                           newList[idx][field.key] = url;
                                                           setAdminData({ ...adminData, dynamicLists: { ...adminData.dynamicLists, [sectionKey]: newList } });
                                                       }
                                                   });
                                               }
                                           }} />
                                        </label>
                                     </div>
                                     </div>
                                  ) : (
                                     <input value={item[field.key] || ''} onChange={(e) => {
                                         const newList = [...adminData.dynamicLists[sectionKey]];
                                         newList[idx][field.key] = e.target.value;
                                         setAdminData({ ...adminData, dynamicLists: { ...adminData.dynamicLists, [sectionKey]: newList } });
                                     }} style={{ width: '100%', padding: '10px', background: theme === 'white' ? '#fff' : '#000', border: theme === 'white' ? '1px solid #cbd5e1' : '1px solid #444', color: theme === 'white' ? '#0f172a' : '#fff', borderRadius: '8px' }} />
                                  )}
                               </div>
                             ))}
                          </div>
                       ))}
                       {((adminData.dynamicLists || {})[sectionKey] || []).length === 0 && (
                          <div style={{ gridColumn: '1 / -1', padding: '40px', textAlign: 'center', color: theme === 'white' ? '#94a3b8' : '#666', border: theme === 'white' ? '1px dashed #cbd5e1' : '1px dashed #333', borderRadius: '12px' }}>
                             Р‘Р°Р·Р° РґР°РЅРЅС‹С… РїСѓСЃС‚Р°. РќР°Р¶РјРёС‚Рµ РєРЅРѕРїРєСѓ "+ {config.addText}".
                          </div>
                       )}
                    </div>
                  </div>
                  
                  {/* --- PAGE CONTENT EDITOR (OPTIONAL/META) --- */}
                  <div style={{ background: theme === 'white' ? '#fff' : '#111', border: theme === 'white' ? '1px solid rgba(0,0,0,0.05)' : '1px solid rgba(255,255,255,0.05)', borderRadius: '12px', padding: '30px', boxShadow: theme === 'white' ? '0 4px 20px rgba(0,0,0,0.05)' : 'none' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', borderBottom: theme === 'white' ? '1px solid #e2e8f0' : '1px solid #333', paddingBottom: '15px' }}>
                       <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: theme === 'white' ? '#0f172a' : '#fff', margin: 0 }}>РњРµС‚Р°-РґР°РЅРЅС‹Рµ СЃС‚СЂР°РЅРёС†С‹ (РћРїС†РёРѕРЅР°Р»СЊРЅРѕ)</h3>
                       <button onClick={() => alert('РњРµС‚Р°-РґР°РЅРЅС‹Рµ СѓСЃРїРµС€РЅРѕ СЃРѕС…СЂР°РЅРµРЅС‹!')} style={{ background: '#10b981', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.85rem' }}>РЎРѕС…СЂР°РЅРёС‚СЊ РјРµС‚Р°-РґР°РЅРЅС‹Рµ</button>
                    </div>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                      <div>
                          <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: theme === 'white' ? '#64748b' : '#888', marginBottom: '8px' }}>Р—Р°РіРѕР»РѕРІРѕРє СЃС‚СЂР°РЅРёС†С‹ (H1)</label>
                          <input type="text" placeholder="Р’РІРµРґРёС‚Рµ РіР»Р°РІРЅС‹Р№ Р·Р°РіРѕР»РѕРІРѕРє..." defaultValue="" style={{ width: '100%', padding: '12px', background: theme === 'white' ? '#f8fafc' : '#000', border: theme === 'white' ? '1px solid #cbd5e1' : '1px solid #444', color: theme === 'white' ? '#0f172a' : '#fff', borderRadius: '8px' }} />
                      </div>
                      
                      <div>
                          <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: theme === 'white' ? '#64748b' : '#888', marginBottom: '8px' }}>РљСЂР°С‚РєРѕРµ РѕРїРёСЃР°РЅРёРµ / РџРѕРґР·Р°РіРѕР»РѕРІРѕРє (РІ С€Р°РїРєРµ)</label>
                          <textarea rows={2} placeholder="РџР°СЂР°РіСЂР°С„ РїРѕРґ Р·Р°РіРѕР»РѕРІРєРѕРј..." defaultValue="" style={{ width: '100%', padding: '12px', background: theme === 'white' ? '#f8fafc' : '#000', border: theme === 'white' ? '1px solid #cbd5e1' : '1px solid #444', color: theme === 'white' ? '#0f172a' : '#fff', borderRadius: '8px', fontFamily: 'inherit' }} />
                      </div>
                    </div>
                  </div>

                </div>
                );
              })()}

              {activeAdminSection === 'blocks' && (
                <div style={{ background: theme === 'white' ? '#fff' : '#111', border: theme === 'white' ? '1px solid rgba(0,0,0,0.05)' : '1px solid rgba(255,255,255,0.05)', borderRadius: '12px', padding: '30px', boxShadow: theme === 'white' ? '0 4px 20px rgba(0,0,0,0.05)' : 'none' }}>
                  <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '30px', color: theme === 'white' ? '#0f172a' : '#fff', borderBottom: theme === 'white' ? '1px solid #e2e8f0' : '1px solid #333', paddingBottom: '15px' }}>РЈРїСЂР°РІР»РµРЅРёРµ Р‘Р°Р·Р°РјРё Р”Р°РЅРЅС‹С…</h3>
                  
                  {/* РљРћРњРђРќР”Рђ */}
                  <div style={{ marginBottom: '40px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ background: 'rgba(6, 182, 212, 0.1)', padding: '8px', borderRadius: '8px', color: '#06b6d4' }}><Users size={20} /></div>
                        <h4 style={{ color: theme === 'white' ? '#0f172a' : '#fff', fontSize: '1.2rem', margin: 0 }}>РљРѕРјР°РЅРґР°</h4>
                      </div>
                      <button onClick={() => setAdminData(prev => ({...prev, team: [...(prev.team || []), {name: 'РќРѕРІС‹Р№ СЃРѕС‚СЂСѓРґРЅРёРє', role: 'Р”РѕР»Р¶РЅРѕСЃС‚СЊ', badge: 'РЎРџР•Р¦РРђР›РРЎРў', desc: '', img: ''}]}))} style={{ background: '#06b6d4', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>+ Р”РѕР±Р°РІРёС‚СЊ СЃРѕС‚СЂСѓРґРЅРёРєР°</button>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
                      {(adminData.team || []).map((member, i) => (
                        <div key={i} style={{ background: theme === 'white' ? '#f8fafc' : '#1a1a1a', border: theme === 'white' ? '1px solid #e2e8f0' : '1px solid #333', borderRadius: '12px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                             <label style={{ fontSize: '0.8rem', color: theme === 'white' ? '#64748b' : '#888', fontWeight: 'bold' }}>РЎРѕС‚СЂСѓРґРЅРёРє #{i + 1}</label>
                             <button onClick={() => { const arr = (adminData.team || []).filter((_, idx) => idx !== i); setAdminData({...adminData, team: arr}); }} style={{ color: '#ef4444', background: 'rgba(239, 68, 68, 0.1)', padding: '6px', borderRadius: '6px', border: 'none', cursor: 'pointer' }}><Trash2 size={14} /></button>
                          </div>
                          <div>
                            <label style={{ display: 'block', fontSize: '0.8rem', color: theme === 'white' ? '#64748b' : '#888', marginBottom: '5px' }}>Р¤Р°РјРёР»РёСЏ РРјСЏ</label>
                            <input value={member.name} onChange={e => { const arr = [...(adminData.team || [])]; arr[i].name = e.target.value; setAdminData({...adminData, team: arr}); }} style={{ width: '100%', padding: '10px 12px', background: theme === 'white' ? '#fff' : '#000', color: theme === 'white' ? '#0f172a' : '#fff', border: theme === 'white' ? '1px solid #cbd5e1' : '1px solid #444', borderRadius: '6px' }} />
                          </div>
                          <div>
                            <label style={{ display: 'block', fontSize: '0.8rem', color: theme === 'white' ? '#64748b' : '#888', marginBottom: '5px' }}>Р”РѕР»Р¶РЅРѕСЃС‚СЊ</label>
                            <input value={member.role || member.position || ''} onChange={e => { const arr = [...(adminData.team || [])]; arr[i].role = e.target.value; setAdminData({...adminData, team: arr}); }} style={{ width: '100%', padding: '10px 12px', background: theme === 'white' ? '#fff' : '#000', color: theme === 'white' ? '#0f172a' : '#fff', border: theme === 'white' ? '1px solid #cbd5e1' : '1px solid #444', borderRadius: '6px' }} />
                          </div>
                          <div>
                            <label style={{ display: 'block', fontSize: '0.8rem', color: theme === 'white' ? '#64748b' : '#888', marginBottom: '5px' }}>Р‘РµР№РґР¶ (РЅР°РїСЂРёРјРµСЂ: Р РЈРљРћР’РћР”РЎРўР’Рћ)</label>
                            <input value={member.badge || ''} onChange={e => { const arr = [...(adminData.team || [])]; arr[i].badge = e.target.value; setAdminData({...adminData, team: arr}); }} style={{ width: '100%', padding: '10px 12px', background: theme === 'white' ? '#fff' : '#000', color: theme === 'white' ? '#0f172a' : '#fff', border: theme === 'white' ? '1px solid #cbd5e1' : '1px solid #444', borderRadius: '6px' }} />
                          </div>
                          <div>
                            <label style={{ display: 'block', fontSize: '0.8rem', color: theme === 'white' ? '#64748b' : '#888', marginBottom: '5px' }}>Р¤РѕС‚РѕРіСЂР°С„РёСЏ</label>
                            <ImageUploadField value={member.img || member.image || ''} onChange={v => { const arr = [...(adminData.team || [])]; arr[i].img = v; setAdminData({...adminData, team: arr}); }} theme={theme} />
                          </div>
                          <div>
                            <label style={{ display: 'block', fontSize: '0.8rem', color: theme === 'white' ? '#64748b' : '#888', marginBottom: '5px' }}>РћРїРёСЃР°РЅРёРµ</label>
                            <textarea value={member.desc} onChange={e => { const arr = [...(adminData.team || [])]; arr[i].desc = e.target.value; setAdminData({...adminData, team: arr}); }} rows={3} style={{ width: '100%', padding: '10px 12px', background: theme === 'white' ? '#fff' : '#000', color: theme === 'white' ? '#0f172a' : '#fff', border: theme === 'white' ? '1px solid #cbd5e1' : '1px solid #444', borderRadius: '6px', resize: 'vertical' }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* РџР РћР•РљРўР« */}
                  <div style={{ marginBottom: '40px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ background: 'rgba(59, 130, 246, 0.1)', padding: '8px', borderRadius: '8px', color: '#3b82f6' }}><MapPin size={20} /></div>
                        <h4 style={{ color: theme === 'white' ? '#0f172a' : '#fff', fontSize: '1.2rem', margin: 0 }}>РџСЂРѕРµРєС‚С‹ (Р’С‹РїРѕР»РЅРµРЅРЅС‹Рµ РѕР±СЉРµРєС‚С‹)</h4>
                      </div>
                      <button onClick={() => setAdminData({...adminData, projects: [{id: Date.now().toString(), name: 'РќРѕРІС‹Р№ РїСЂРѕРµРєС‚', client: 'РљР»РёРµРЅС‚', type: 'РЈСЃР»СѓРіР°', loc: 'Р›РѕРєР°С†РёСЏ', specs: 'РћРїРёСЃР°РЅРёРµ', coords: [48, 66]}, ...(adminData.projects || [])]})} style={{ background: '#3b82f6', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>+ Р”РѕР±Р°РІРёС‚СЊ РїСЂРѕРµРєС‚</button>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                      {(adminData.projects || []).map((p, i) => (
                        <div key={i} style={{ padding: '15px', border: theme === 'white' ? '1px solid #e2e8f0' : '1px solid #333', borderRadius: '10px', background: theme === 'white' ? '#f8fafc' : '#1a1a1a', display: 'flex', flexDirection: 'column', gap: '15px', transition: 'all 0.2s', position: 'relative' }}>
                          <button onClick={() => { const arr = (adminData.projects || []).filter((_, idx) => idx !== i); setAdminData({...adminData, projects: arr}); }} style={{ position: 'absolute', top: '15px', right: '15px', color: '#ef4444', background: 'rgba(239, 68, 68, 0.1)', padding: '8px', borderRadius: '8px', border: 'none', cursor: 'pointer' }}><Trash2 size={18} /></button>
                          
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px', paddingRight: '50px' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                              <label style={{ fontSize: '0.75rem', color: theme === 'white' ? '#64748b' : '#888' }}>РќР°Р·РІР°РЅРёРµ РѕР±СЉРµРєС‚Р°</label>
                              <input value={p.name} onChange={e => { const arr = [...(adminData.projects || [])]; arr[i].name = e.target.value; setAdminData({...adminData, projects: arr}); }} style={{ padding: '8px 12px', background: theme === 'white' ? '#fff' : '#000', color: theme === 'white' ? '#0f172a' : '#fff', border: theme === 'white' ? '1px solid #cbd5e1' : '1px solid #444', borderRadius: '6px' }} />
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                              <label style={{ fontSize: '0.75rem', color: theme === 'white' ? '#64748b' : '#888' }}>Р—Р°РєР°Р·С‡РёРє</label>
                              <input value={p.client} onChange={e => { const arr = [...(adminData.projects || [])]; arr[i].client = e.target.value; setAdminData({...adminData, projects: arr}); }} style={{ padding: '8px 12px', background: theme === 'white' ? '#fff' : '#000', color: theme === 'white' ? '#0f172a' : '#fff', border: theme === 'white' ? '1px solid #cbd5e1' : '1px solid #444', borderRadius: '6px' }} />
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                              <label style={{ fontSize: '0.75rem', color: theme === 'white' ? '#64748b' : '#888' }}>Р¤РѕС‚Рѕ РѕР±СЉРµРєС‚Р°</label>
                              <ImageUploadField value={p.image || ''} onChange={v => { const arr = [...(adminData.projects || [])]; arr[i].image = v; setAdminData({...adminData, projects: arr}); }} theme={theme} />
                            </div>
                          </div>

                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 2fr 100px', gap: '15px' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                              <label style={{ fontSize: '0.75rem', color: theme === 'white' ? '#64748b' : '#888' }}>Р›РѕРєР°С†РёСЏ</label>
                              <input value={p.loc || ''} onChange={e => { const arr = [...(adminData.projects || [])]; arr[i].loc = e.target.value; setAdminData({...adminData, projects: arr}); }} placeholder="Рі. РђР»РјР°С‚С‹" style={{ padding: '8px 12px', background: theme === 'white' ? '#fff' : '#000', color: theme === 'white' ? '#0f172a' : '#fff', border: theme === 'white' ? '1px solid #cbd5e1' : '1px solid #444', borderRadius: '6px' }} />
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                              <label style={{ fontSize: '0.75rem', color: theme === 'white' ? '#64748b' : '#888' }}>Р’РёРґ СЂР°Р±РѕС‚</label>
                              <input value={p.type || ''} onChange={e => { const arr = [...(adminData.projects || [])]; arr[i].type = e.target.value; setAdminData({...adminData, projects: arr}); }} placeholder="РРЅР¶РµРЅРµСЂРЅР°СЏ РіРµРѕР»РѕРіРёСЏ" style={{ padding: '8px 12px', background: theme === 'white' ? '#fff' : '#000', color: theme === 'white' ? '#0f172a' : '#fff', border: theme === 'white' ? '1px solid #cbd5e1' : '1px solid #444', borderRadius: '6px' }} />
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                              <label style={{ fontSize: '0.75rem', color: theme === 'white' ? '#64748b' : '#888' }}>РЎРїРµС†РёС„РёРєР°С†РёСЏ</label>
                              <input value={p.specs || ''} onChange={e => { const arr = [...(adminData.projects || [])]; arr[i].specs = e.target.value; setAdminData({...adminData, projects: arr}); }} placeholder="12 СЃРєРІР°Р¶РёРЅ РїРѕ 35Рј" style={{ padding: '8px 12px', background: theme === 'white' ? '#fff' : '#000', color: theme === 'white' ? '#0f172a' : '#fff', border: theme === 'white' ? '1px solid #cbd5e1' : '1px solid #444', borderRadius: '6px' }} />
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                              <label style={{ fontSize: '0.75rem', color: theme === 'white' ? '#64748b' : '#888' }}>Р“РѕРґ</label>
                              <input value={p.year || ''} onChange={e => { const arr = [...(adminData.projects || [])]; arr[i].year = e.target.value; setAdminData({...adminData, projects: arr}); }} placeholder="2025" style={{ padding: '8px 12px', background: theme === 'white' ? '#fff' : '#000', color: theme === 'white' ? '#0f172a' : '#fff', border: theme === 'white' ? '1px solid #cbd5e1' : '1px solid #444', borderRadius: '6px' }} />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div style={{ marginTop: '30px', paddingTop: '20px', borderTop: theme === 'white' ? '1px solid #e2e8f0' : '1px solid #333', display: 'flex', justifyContent: 'flex-end' }}>
                    <button 
                      onClick={async () => {
                        await saveAdminData();
                        alert('вњ… Р‘Р°Р·Р° РґР°РЅРЅС‹С… СѓСЃРїРµС€РЅРѕ СЃРѕС…СЂР°РЅРµРЅР° Рё СЃРёРЅС…СЂРѕРЅРёР·РёСЂРѕРІР°РЅР°!');
                      }} 
                      style={{ background: '#10b981', color: '#fff', border: 'none', padding: '12px 30px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px' }}
                    >
                      <Save size={18} /> РЎРѕС…СЂР°РЅРёС‚СЊ Р±Р°Р·С‹ РґР°РЅРЅС‹С…
                    </button>
                  </div>

                </div>
              )}

              {activeAdminSection === 'director' && (
                <div style={{ background: theme === 'white' ? '#fff' : '#111', border: theme === 'white' ? '1px solid rgba(0,0,0,0.05)' : '1px solid rgba(255,255,255,0.05)', borderRadius: '12px', padding: '30px', boxShadow: theme === 'white' ? '0 4px 20px rgba(0,0,0,0.05)' : 'none' }}>
                  <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '10px', color: theme === 'white' ? '#0f172a' : '#fff' }}>РЈРїСЂР°РІР»РµРЅРёРµ РґР°РЅРЅС‹РјРё Р СѓРєРѕРІРѕРґСЃС‚РІР° (РћСЃРЅРѕРІР°С‚РµР»СЊ)</h3>
                  <p style={{ fontSize: '0.9rem', color: theme === 'white' ? '#64748b' : '#888', marginBottom: '30px' }}>Р”Р°РЅРЅС‹Рµ РѕС‚СЃСЋРґР° Р°РІС‚РѕРјР°С‚РёС‡РµСЃРєРё РѕС‚РѕР±СЂР°Р¶Р°СЋС‚СЃСЏ РЅР° Р“Р»Р°РІРЅРѕР№ СЃС‚СЂР°РЅРёС†Рµ, РЅР° СЃС‚СЂР°РЅРёС†Рµ В«Рћ РєРѕРјРїР°РЅРёРёВ» Рё РІ Р±Р°Р·Рµ РєРѕРјР°РЅРґС‹.</p>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '800px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 'bold', color: theme === 'white' ? '#0f172a' : '#fff', marginBottom: '8px' }}>Р¤РѕС‚РѕРіСЂР°С„РёСЏ РћСЃРЅРѕРІР°С‚РµР»СЏ / Р”РёСЂРµРєС‚РѕСЂР°</label>
                      <ImageUploadField 
                        value={adminData.media?.directorImage || adminData.team?.[0]?.img || '/images/director.png'} 
                        onChange={v => {
                          setAdminData(prev => {
                            const newTeam = [...(prev.team || [])];
                            if (newTeam[0]) newTeam[0] = { ...newTeam[0], img: v };
                            return {
                              ...prev,
                              media: { ...(prev.media || {}), directorImage: v },
                              team: newTeam
                            };
                          });
                        }} 
                        theme={theme} 
                      />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 'bold', color: theme === 'white' ? '#0f172a' : '#fff', marginBottom: '8px' }}>РРјСЏ (РЅР°РїСЂРёРјРµСЂ: РЁРµРЅРІРёР·РѕРІ Р СѓРґРѕР»СЊС„)</label>
                        <input 
                          type="text" 
                          value={adminData.visualTexts?.['f_name'] || (adminData.team?.[0]?.name ? adminData.team[0].name.split(' ').slice(0,2).join(' ') : 'РЁРµРЅРІРёР·РѕРІ Р СѓРґРѕР»СЊС„')} 
                          onChange={(e) => {
                            const val = e.target.value;
                            setAdminData(prev => ({
                              ...prev,
                              visualTexts: { ...(prev.visualTexts || {}), f_name: val }
                            }));
                            if (typeof localStorage !== 'undefined') localStorage.setItem('vb_f_name', val);
                            window.dispatchEvent(new CustomEvent('vb_update', { detail: { id: 'f_name', text: val } }));
                          }} 
                          style={{ width: '100%', padding: '12px', background: theme === 'white' ? '#f8fafc' : '#000', border: theme === 'white' ? '1px solid #cbd5e1' : '1px solid #444', color: theme === 'white' ? '#0f172a' : '#fff', borderRadius: '8px' }} 
                        />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 'bold', color: theme === 'white' ? '#0f172a' : '#fff', marginBottom: '8px' }}>РћС‚С‡РµСЃС‚РІРѕ / Р¤Р°РјРёР»РёСЏ (РЅР°РїСЂРёРјРµСЂ: РљРѕРЅСЃС‚Р°РЅС‚РёРЅРѕРІРёС‡)</label>
                        <input 
                          type="text" 
                          value={adminData.visualTexts?.['f_patr'] || (adminData.team?.[0]?.name ? adminData.team[0].name.split(' ').slice(2).join(' ') : 'РљРѕРЅСЃС‚Р°РЅС‚РёРЅРѕРІРёС‡')} 
                          onChange={(e) => {
                            const val = e.target.value;
                            setAdminData(prev => ({
                              ...prev,
                              visualTexts: { ...(prev.visualTexts || {}), f_patr: val }
                            }));
                            if (typeof localStorage !== 'undefined') localStorage.setItem('vb_f_patr', val);
                            window.dispatchEvent(new CustomEvent('vb_update', { detail: { id: 'f_patr', text: val } }));
                          }} 
                          style={{ width: '100%', padding: '12px', background: theme === 'white' ? '#f8fafc' : '#000', border: theme === 'white' ? '1px solid #cbd5e1' : '1px solid #444', color: theme === 'white' ? '#0f172a' : '#fff', borderRadius: '8px' }} 
                        />
                      </div>
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 'bold', color: theme === 'white' ? '#0f172a' : '#fff', marginBottom: '8px' }}>Р”РѕР»Р¶РЅРѕСЃС‚СЊ / Р‘РµР№РґР¶ (РЅР°РїСЂРёРјРµСЂ: РћРЎРќРћР’РђРўР•Р›Р¬ Р Р“Р›РђР’РќР«Р™ Р“Р•РћР›РћР“)</label>
                      <input 
                        type="text" 
                        value={adminData.visualTexts?.['f_role'] || adminData.team?.[0]?.badge || adminData.team?.[0]?.role || 'РћСЃРЅРѕРІР°С‚РµР»СЊ Рё Р“Р»Р°РІРЅС‹Р№ Р“РµРѕР»РѕРі'} 
                        onChange={(e) => {
                          const val = e.target.value;
                          setAdminData(prev => ({
                            ...prev,
                            visualTexts: { ...(prev.visualTexts || {}), f_role: val }
                          }));
                          if (typeof localStorage !== 'undefined') localStorage.setItem('vb_f_role', val);
                          window.dispatchEvent(new CustomEvent('vb_update', { detail: { id: 'f_role', text: val } }));
                        }} 
                        style={{ width: '100%', padding: '12px', background: theme === 'white' ? '#f8fafc' : '#000', border: theme === 'white' ? '1px solid #cbd5e1' : '1px solid #444', color: theme === 'white' ? '#0f172a' : '#fff', borderRadius: '8px' }} 
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 'bold', color: theme === 'white' ? '#0f172a' : '#fff', marginBottom: '8px' }}>РћРїРёСЃР°РЅРёРµ / РЎР»РѕРІРѕ РћСЃРЅРѕРІР°С‚РµР»СЏ / РСЃС‚РѕСЂРёСЏ</label>
                      <textarea 
                        rows={5} 
                        value={adminData.visualTexts?.['f_quote'] || adminData.team?.[0]?.desc || 'Р СѓРґРѕР»СЊС„ РљРѕРЅСЃС‚Р°РЅС‚РёРЅРѕРІРёС‡ РѕСЃРЅРѕРІР°Р» РєРѕРјРїР°РЅРёСЋ РІ 2019 РіРѕРґСѓ...'} 
                        onChange={(e) => {
                          const val = e.target.value;
                          setAdminData(prev => ({
                            ...prev,
                            visualTexts: { ...(prev.visualTexts || {}), f_quote: val }
                          }));
                          if (typeof localStorage !== 'undefined') localStorage.setItem('vb_f_quote', val);
                          window.dispatchEvent(new CustomEvent('vb_update', { detail: { id: 'f_quote', text: val } }));
                        }} 
                        style={{ width: '100%', padding: '12px', background: theme === 'white' ? '#f8fafc' : '#000', border: theme === 'white' ? '1px solid #cbd5e1' : '1px solid #444', color: theme === 'white' ? '#0f172a' : '#fff', borderRadius: '8px', fontFamily: 'inherit' }} 
                      />
                    </div>

                    <div style={{ marginTop: '20px' }}>
                      <button 
                        onClick={async () => {
                          await saveAdminData();
                          alert('вњ… Р”Р°РЅРЅС‹Рµ СЂСѓРєРѕРІРѕРґСЃС‚РІР° СѓСЃРїРµС€РЅРѕ СЃРѕС…СЂР°РЅРµРЅС‹ Рё СЃРёРЅС…СЂРѕРЅРёР·РёСЂРѕРІР°РЅС‹ СЃ СЃРµСЂРІРµСЂРѕРј!');
                        }} 
                        style={{ background: '#10b981', color: '#fff', border: 'none', padding: '14px 30px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '1rem', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                      >
                        <Save size={18} /> РЎРѕС…СЂР°РЅРёС‚СЊ РёР·РјРµРЅРµРЅРёСЏ СЂСѓРєРѕРІРѕРґСЃС‚РІР° Рё СЃРёРЅС…СЂРѕРЅРёР·РёСЂРѕРІР°С‚СЊ СЃ СЃРµСЂРІРµСЂРѕРј
                      </button>
                    </div>
                  </div>
                </div>
              )}

              
              {activeAdminSection.startsWith('cms_') && (
                <div style={{ background: theme === 'white' ? '#fff' : '#111', border: theme === 'white' ? '1px solid rgba(0,0,0,0.05)' : '1px solid rgba(255,255,255,0.05)', borderRadius: '12px', padding: '30px', boxShadow: theme === 'white' ? '0 4px 20px rgba(0,0,0,0.05)' : 'none' }}>
                  


                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: theme === 'white' ? '#0f172a' : '#fff', margin: 0 }}>
                      РџРѕРґСЂР°Р·РґРµР»С‹: {dynamicMenu['ru'].find(m => m.page === activeAdminSection.replace('cms_', ''))?.title}
                    </h3>
                    <button onClick={() => {
                        const newMenu = JSON.parse(JSON.stringify(dynamicMenu));
                        const catIndex = newMenu['ru'].findIndex(m => m.page === activeAdminSection.replace('cms_', ''));
                        if (catIndex !== -1) {
                            const newSubId = 'sub_' + Date.now();
                            if (!newMenu['ru'][catIndex].items) newMenu['ru'][catIndex].items = [];
                            newMenu['ru'][catIndex].items.push({ name: 'РќРѕРІС‹Р№ РїРѕРґСЂР°Р·РґРµР»', action: { type: 'page', val: activeAdminSection.replace('cms_', ''), subpage: newSubId } });
                            setAdminData({...adminData, menu: newMenu});
                        }
                    }} style={{ background: '#3b82f6', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>+ Р”РѕР±Р°РІРёС‚СЊ РїРѕРґСЂР°Р·РґРµР»</button>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '15px' }}>
                    {dynamicMenu['ru'].find(m => m.page === activeAdminSection.replace('cms_', ''))?.items.map((sub, sidx) => (
                      <div key={sidx} style={{ padding: '20px', background: theme === 'white' ? '#fff' : '#111', border: theme === 'white' ? '1px solid #e2e8f0' : '1px solid #333', borderRadius: '12px', display: 'flex', flexDirection: 'column', gap: '20px', boxShadow: theme === 'white' ? '0 4px 15px rgba(0,0,0,0.03)' : 'none', transition: 'transform 0.2s', transform: 'translateY(0)' }} onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'} onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                             <input value={sub.name} onChange={(e) => {
                                 const newMenu = JSON.parse(JSON.stringify(dynamicMenu));
                                 const catIndex = newMenu['ru'].findIndex(m => m.page === activeAdminSection.replace('cms_', ''));
                                 if (catIndex !== -1) {
                                     newMenu['ru'][catIndex].items[sidx].name = e.target.value;
                                     setAdminData({...adminData, menu: newMenu});
                                 }
                             }} style={{ fontSize: '1.1rem', fontWeight: 'bold', background: 'transparent', border: '1px solid transparent', outline: 'none', color: theme === 'white' ? '#0f172a' : '#fff', flex: 1, minWidth: 0, textOverflow: 'ellipsis', padding: '4px 8px', marginLeft: '-8px', borderRadius: '6px', transition: 'border 0.2s' }} onFocus={(e) => e.target.style.border = theme === 'white' ? '1px dashed #cbd5e1' : '1px dashed #444'} onBlur={(e) => e.target.style.border = '1px solid transparent'} />
                             <button onClick={() => {
                                 const newMenu = JSON.parse(JSON.stringify(dynamicMenu));
                                 const catIndex = newMenu['ru'].findIndex(m => m.page === activeAdminSection.replace('cms_', ''));
                                 if (catIndex !== -1) {
                                     newMenu['ru'][catIndex].items.splice(sidx, 1);
                                     setAdminData({...adminData, menu: newMenu});
                                 }
                             }} style={{ background: 'rgba(239, 68, 68, 0.1)', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '8px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s', marginLeft: '10px' }} onMouseOver={(e) => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)'} onMouseOut={(e) => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'}><Trash2 size={16}/></button>
                          </div>
                          
                          <button onClick={() => {
                             if (sub.action) {
                                 if (sub.action.type === 'service') {
                                     setActiveAdminSection('services');
                                     const sIndex = adminData.services.findIndex(s => s.id === sub.action.val || s.code?.toLowerCase().includes(sub.action.val));
                                     if (sIndex !== -1 && typeof setEditingServiceIndex === 'function') {
                                         setEditingServiceIndex(sIndex);
                                     }
                                 } else if (sub.action.val === 'projects') {
                                     setActiveAdminSection('blocks');
                                 } else if (sub.action.val === 'about' && sub.action.subpage === 'team') {
                                     setActiveAdminSection('blocks');
                                 } else if (sub.action.val === 'blog' && sub.action.subpage === 'articles') {
                                     setActiveAdminSection('form_knowledge_articles');
                                 } else if (sub.action.type === 'equip') {
                                     setActiveAdminSection('form_equipment_' + (sub.action.cat || 'misc') + '_' + (sub.action.idx !== undefined ? sub.action.idx : '0'));
                                 } else {
                                     setActiveAdminSection('form_' + (sub.action.val || 'unknown') + '_' + (sub.action.subpage || ''));
                                 }
                             }
                          }} style={{ background: theme === 'white' ? '#f8fafc' : '#1a1a1a', border: theme === 'white' ? '1px solid #e2e8f0' : '1px solid #333', padding: '12px', borderRadius: '8px', color: '#06b6d4', fontWeight: 'bold', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', transition: 'all 0.2s' }} onMouseOver={(e) => { e.currentTarget.style.background = '#06b6d4'; e.currentTarget.style.color = '#fff'; e.currentTarget.style.border = '1px solid #06b6d4'; }} onMouseOut={(e) => { e.currentTarget.style.background = theme === 'white' ? '#f8fafc' : '#1a1a1a'; e.currentTarget.style.color = '#06b6d4'; e.currentTarget.style.border = theme === 'white' ? '1px solid #e2e8f0' : '1px solid #333'; }}>
                             РќР°СЃС‚СЂРѕРёС‚СЊ РєРѕРЅС‚РµРЅС‚ <Edit3 size={16}/>
                          </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeAdminSection === 'leads' && (
                <div style={{ background: theme === 'white' ? '#fff' : '#111', border: theme === 'white' ? '1px solid rgba(0,0,0,0.05)' : '1px solid rgba(255,255,255,0.05)', borderRadius: '12px', padding: '30px', boxShadow: theme === 'white' ? '0 4px 20px rgba(0,0,0,0.05)' : 'none' }}>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '20px', color: theme === 'white' ? '#0f172a' : '#fff' }}>Р’С…РѕРґСЏС‰РёРµ Р·Р°СЏРІРєРё ({inquiries.length})</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {inquiries.length === 0 ? (
                      <div style={{ padding: '40px', textAlign: 'center', border: theme === 'white' ? '1px dashed rgba(0,0,0,0.1)' : '1px dashed rgba(255,255,255,0.1)', borderRadius: '12px', color: theme === 'white' ? '#64748b' : '#888' }}>Р‘Р°Р·Р° РґР°РЅРЅС‹С… РїСѓСЃС‚Р°.</div>
                    ) : (
                      inquiries.map(inq => (
                        <div key={inq.id} style={{ background: theme === 'white' ? '#f8fafc' : '#1a1a1a', border: theme === 'white' ? '1px solid rgba(0,0,0,0.05)' : '1px solid rgba(255,255,255,0.05)', borderRadius: '12px', padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div>
                            <div style={{ fontWeight: 'bold', fontSize: '1.1rem', marginBottom: '8px', color: theme === 'white' ? '#0f172a' : '#fff' }}>{inq.name} <span style={{ fontSize: '0.7rem', padding: '2px 6px', borderRadius: '4px', background: 'rgba(6, 182, 212, 0.1)', color: '#06b6d4', marginLeft: '8px' }}>{inq.service_type}</span></div>
                            <div style={{ fontSize: '0.9rem', color: theme === 'white' ? '#475569' : '#aaa', marginBottom: '8px' }}>{inq.message}</div>
                            <a href={`tel:${inq.phone}`} style={{ fontSize: '0.85rem', color: theme === 'white' ? '#0f172a' : '#fff', display: 'inline-flex', alignItems: 'center', gap: '6px', textDecoration: 'none' }}><Phone size={12} color={theme === 'white' ? '#0f172a' : '#fff'}/> {inq.phone}</a>
                          </div>
                          <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: '0.8rem', color: theme === 'white' ? '#64748b' : '#888', marginBottom: '16px' }}>{new Date(inq.created_at).toLocaleString('ru-RU')}</div>
                            <button onClick={() => handleClearInquiry(inq.id)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '8px', borderRadius: '4px', background: 'rgba(239, 68, 68, 0.1)' }}>РЈРґР°Р»РёС‚СЊ <Trash2 size={16} style={{ verticalAlign: 'middle', marginLeft: '4px' }}/></button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {activeAdminSection === 'services' && (
                <div style={{ background: theme === 'white' ? '#fff' : '#111', border: theme === 'white' ? '1px solid rgba(0,0,0,0.05)' : '1px solid rgba(255,255,255,0.05)', borderRadius: '12px', padding: '30px', boxShadow: theme === 'white' ? '0 4px 20px rgba(0,0,0,0.05)' : 'none', position: 'relative' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: theme === 'white' ? '#0f172a' : '#fff' }}>РЈСЃР»СѓРіРё ({adminData.services.length})</h3>
                    <button onClick={() => setAdminData({...adminData, services: [...adminData.services, {id: Date.now().toString(), title: 'РќРѕРІР°СЏ СѓСЃР»СѓРіР°', code: 'NEW-00', desc: '', reg: '', image: ''}]})} style={{ background: '#3b82f6', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer' }}>+ Р”РѕР±Р°РІРёС‚СЊ СѓСЃР»СѓРіСѓ</button>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {adminData.services.map((service, index) => { const key = service.id || index; return (
                      <div key={key} style={{ padding: '16px', border: theme === 'white' ? '1px solid #e2e8f0' : '1px solid #333', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: theme === 'white' ? '#f8fafc' : '#1a1a1a' }}>
                        <div>
                          <div style={{ fontWeight: 'bold', color: theme === 'white' ? '#0f172a' : '#fff' }}>{service.title}</div>
                          <div style={{ fontSize: '0.8rem', color: theme === 'white' ? '#64748b' : '#888', marginTop: '4px' }}>РљРѕРґ: {service.code}</div>
                        </div>
                        <div style={{ display: 'flex', gap: '10px' }}>
                          <button onClick={() => setEditingServiceIndex(index)} style={{ background: 'none', border: 'none', color: '#3b82f6', cursor: 'pointer', padding: '4px 8px' }}>Р РµРґР°РєС‚РёСЂРѕРІР°С‚СЊ</button>
                          <button onClick={() => { const arr = adminData.services.filter((_, idx) => idx !== index); setAdminData({...adminData, services: arr}); }} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '4px 8px' }}>РЈРґР°Р»РёС‚СЊ</button>
                        </div>
                      </div>
                    ); })}
                  </div>

                  {editingServiceIndex !== null && adminData.services[editingServiceIndex] && createPortal((
                    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: theme === 'white' ? 'rgba(15, 23, 42, 0.4)' : 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)', zIndex: 100000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
                      <div style={{ background: theme === 'white' ? '#ffffff' : '#0a0a0a', padding: '40px', borderRadius: '24px', width: '100%', maxWidth: '650px', border: theme === 'white' ? '1px solid #e2e8f0' : '1px solid #333', boxShadow: theme === 'white' ? '0 25px 50px -12px rgba(0, 0, 0, 0.15)' : '0 25px 50px -12px rgba(0, 0, 0, 0.8)', display: 'flex', flexDirection: 'column', gap: '25px', position: 'relative', overflowY: 'auto', maxHeight: '90vh' }}>
                        
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: theme === 'white' ? '1px solid #f1f5f9' : '1px solid #1a1a1a', paddingBottom: '20px' }}>
                          <div>
                            <h3 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 'bold', color: theme === 'white' ? '#0f172a' : '#fff' }}>РќР°СЃС‚СЂРѕР№РєР° СѓСЃР»СѓРіРё</h3>
                            <div style={{ fontSize: '0.85rem', color: theme === 'white' ? '#64748b' : '#666', marginTop: '5px' }}>РРґРµРЅС‚РёС„РёРєР°С‚РѕСЂ: {adminData.services[editingServiceIndex].id || editingServiceIndex}</div>
                          </div>
                          <button onClick={() => setEditingServiceIndex(null)} style={{ background: theme === 'white' ? '#f1f5f9' : '#1a1a1a', border: 'none', color: theme === 'white' ? '#64748b' : '#888', cursor: 'pointer', width: '40px', height: '40px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.2s' }}><X size={20} /></button>
                        </div>
                        
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                          <div style={{ display: 'flex', gap: '20px' }}>
                            <div style={{ flex: 3 }}>
                              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: theme === 'white' ? '#334155' : '#aaa', marginBottom: '8px' }}>РќР°Р·РІР°РЅРёРµ СѓСЃР»СѓРіРё <span style={{ color: '#ef4444' }}>*</span></label>
                              <input value={adminData.services[editingServiceIndex].title} onChange={e => { const arr = [...adminData.services]; arr[editingServiceIndex].title = e.target.value; setAdminData({...adminData, services: arr}); }} style={{ width: '100%', padding: '12px 16px', fontSize: '1rem', background: theme === 'white' ? '#f8fafc' : '#000', color: theme === 'white' ? '#0f172a' : '#fff', border: theme === 'white' ? '1px solid #cbd5e1' : '1px solid #444', borderRadius: '10px', transition: 'border 0.2s', outline: 'none' }} />
                            </div>
                            <div style={{ flex: 1 }}>
                              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: theme === 'white' ? '#334155' : '#aaa', marginBottom: '8px' }}>Р’РЅСѓС‚СЂ. РєРѕРґ</label>
                              <input value={adminData.services[editingServiceIndex].code} onChange={e => { const arr = [...adminData.services]; arr[editingServiceIndex].code = e.target.value; setAdminData({...adminData, services: arr}); }} style={{ width: '100%', padding: '12px 16px', fontSize: '1rem', background: theme === 'white' ? '#f8fafc' : '#000', color: theme === 'white' ? '#0f172a' : '#fff', border: theme === 'white' ? '1px solid #cbd5e1' : '1px solid #444', borderRadius: '10px', outline: 'none' }} />
                            </div>
                          </div>
                          
                          <div>
                            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: theme === 'white' ? '#334155' : '#aaa', marginBottom: '8px' }}>РћР±Р»РѕР¶РєР° СѓСЃР»СѓРіРё (С„РѕС‚Рѕ)</label>
                            <ImageUploadField value={adminData.services[editingServiceIndex].image || ''} onChange={v => { const arr = [...adminData.services]; arr[editingServiceIndex].image = v; setAdminData({...adminData, services: arr}); }} theme={theme} />
                          </div>

                          <div>
                            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: theme === 'white' ? '#334155' : '#aaa', marginBottom: '8px' }}>РќРѕСЂРјР°С‚РёРІРЅР°СЏ Р±Р°Р·Р° (РЎРќРёРџ, Р“РћРЎРў)</label>
                            <input value={adminData.services[editingServiceIndex].reg || ''} onChange={e => { const arr = [...adminData.services]; arr[editingServiceIndex].reg = e.target.value; setAdminData({...adminData, services: arr}); }} style={{ width: '100%', padding: '12px 16px', fontSize: '1rem', background: theme === 'white' ? '#f8fafc' : '#000', color: theme === 'white' ? '#0f172a' : '#fff', border: theme === 'white' ? '1px solid #cbd5e1' : '1px solid #444', borderRadius: '10px', outline: 'none' }} placeholder="РќР°РїСЂРёРјРµСЂ: РЎРќРёРџ Р Рљ 1.02-18-2004" />
                          </div>

                          <div>
                            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: theme === 'white' ? '#334155' : '#aaa', marginBottom: '8px' }}>РћС„РёС†РёР°Р»СЊРЅРѕРµ РѕРїРёСЃР°РЅРёРµ (РґР»СЏ РєР°С‚Р°Р»РѕРіР°)</label>
                            <textarea value={adminData.services[editingServiceIndex].desc || ''} onChange={e => { const arr = [...adminData.services]; arr[editingServiceIndex].desc = e.target.value; setAdminData({...adminData, services: arr}); }} rows={5} style={{ width: '100%', padding: '16px', fontSize: '1rem', background: theme === 'white' ? '#f8fafc' : '#000', color: theme === 'white' ? '#0f172a' : '#fff', border: theme === 'white' ? '1px solid #cbd5e1' : '1px solid #444', borderRadius: '10px', resize: 'vertical', lineHeight: '1.6', outline: 'none' }} placeholder="РЈРєР°Р¶РёС‚Рµ РїРѕРґСЂРѕР±РЅРѕРµ РѕРїРёСЃР°РЅРёРµ СЃРѕСЃС‚Р°РІР° СЂР°Р±РѕС‚..." />
                          </div>
                          
                          <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end', gap: '15px' }}>
                            <button onClick={() => setEditingServiceIndex(null)} style={{ background: 'transparent', color: theme === 'white' ? '#64748b' : '#aaa', border: 'none', padding: '12px 24px', borderRadius: '10px', cursor: 'pointer', fontWeight: 'bold', fontSize: '1rem' }}>РћС‚РјРµРЅР°</button>
                            <button onClick={() => setEditingServiceIndex(null)} style={{ background: 'var(--color-cyan)', color: '#fff', border: 'none', padding: '12px 30px', borderRadius: '10px', cursor: 'pointer', fontWeight: 'bold', fontSize: '1rem', boxShadow: '0 4px 14px rgba(6, 182, 212, 0.4)' }}>РЎРѕС…СЂР°РЅРёС‚СЊ РёР·РјРµРЅРµРЅРёСЏ</button>
                          </div>
                        </div>
                      </div>
                    </div>
                    ), document.body)                  }
                </div>
              )}

              {activeAdminSection === 'content' && (
                <div style={{ background: theme === 'white' ? '#fff' : '#111', border: theme === 'white' ? '1px solid rgba(0,0,0,0.05)' : '1px solid rgba(255,255,255,0.05)', borderRadius: '12px', padding: '30px', boxShadow: theme === 'white' ? '0 4px 20px rgba(0,0,0,0.05)' : 'none' }}>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '20px', color: theme === 'white' ? '#0f172a' : '#fff' }}>РўРµРєСЃС‚С‹ Рё РїРµСЂРµРІРѕРґС‹</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                    {Object.keys(translations).map(lang => (
                      <div key={lang} style={{ padding: '20px', border: theme === 'white' ? '1px solid #e2e8f0' : '1px solid #333', borderRadius: '8px', textAlign: 'center' }}>
                        <div style={{ fontSize: '2rem', marginBottom: '10px' }}>{lang === 'ru' ? 'рџ‡·рџ‡є' : lang === 'kk' ? 'рџ‡°рџ‡ї' : 'рџ‡¬рџ‡§'}</div>
                        <div style={{ fontWeight: 'bold', textTransform: 'uppercase', color: theme === 'white' ? '#0f172a' : '#fff', marginBottom: '10px' }}>{lang}</div>
                        <button style={{ background: '#3b82f6', color: '#000', border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', width: '100%' }}>Р РµРґР°РєС‚РёСЂРѕРІР°С‚СЊ</button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeAdminSection === 'pages' && (
                <div style={{ background: theme === 'white' ? '#fff' : '#111', border: theme === 'white' ? '1px solid rgba(0,0,0,0.05)' : '1px solid rgba(255,255,255,0.05)', borderRadius: '12px', padding: '30px', boxShadow: theme === 'white' ? '0 4px 20px rgba(0,0,0,0.05)' : 'none' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: theme === 'white' ? '#0f172a' : '#fff' }}>
                      РЎС‚СЂСѓРєС‚СѓСЂР° СЃР°Р№С‚Р° ({dynamicMenu[language].reduce((acc, curr) => acc + 1 + (curr.items ? curr.items.length : 0), 0)} СЃС‚СЂР°РЅРёС†)
                    </h3>
                    <button onClick={() => alert('Р”РѕР±Р°РІР»РµРЅРёРµ РЅРѕРІС‹С… СЃС‚СЂР°РЅРёС† РІ РґР°РЅРЅС‹Р№ РјРѕРјРµРЅС‚ С‚СЂРµР±СѓРµС‚ СѓС‡Р°СЃС‚РёСЏ СЂР°Р·СЂР°Р±РѕС‚С‡РёРєР°, С‚Р°Рє РєР°Рє РєР°Р¶РґР°СЏ СЃС‚СЂР°РЅРёС†Р° РёРјРµРµС‚ СѓРЅРёРєР°Р»СЊРЅС‹Р№ РґРёР·Р°Р№РЅ Рё Р°РЅРёРјР°С†РёРё РІ РєРѕРґРµ.')} style={{ background: '#ec4899', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer' }}>+ Р”РѕР±Р°РІРёС‚СЊ СЃС‚СЂР°РЅРёС†Сѓ</button>
                  </div>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {dynamicMenu[language].map((page, idx) => (
                      <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {/* Parent Page */}
                        <div style={{ padding: '16px', background: theme === 'white' ? '#f8fafc' : '#1a1a1a', border: theme === 'white' ? '1px solid #e2e8f0' : '1px solid #333', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div>
                            <div style={{ fontWeight: 'bold', color: theme === 'white' ? '#0f172a' : '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <Folder size={16} color="#ec4899" /> {page.title}
                            </div>
                            <div style={{ fontSize: '0.8rem', color: theme === 'white' ? '#64748b' : '#888', marginTop: '4px', marginLeft: '24px' }}>Path: /{page.page}</div>
                          </div>
                          <div style={{ display: 'flex', gap: '10px' }}>
                            <button onClick={() => alert('SEO РЅР°СЃС‚СЂРѕР№РєРё РґР»СЏ СЌС‚РѕР№ СЃС‚СЂР°РЅРёС†С‹ СЃРєРѕСЂРѕ Р±СѓРґСѓС‚ РґРѕСЃС‚СѓРїРЅС‹ РґР»СЏ СЂРµРґР°РєС‚РёСЂРѕРІР°РЅРёСЏ.')} style={{ background: 'none', border: 'none', color: '#ec4899', cursor: 'pointer' }}>SEO</button>
                            <button onClick={() => alert('Р”Р»СЏ РёР·РјРµРЅРµРЅРёСЏ РєРѕРЅС‚РµРЅС‚Р° СЌС‚РѕР№ СЃС‚СЂР°РЅРёС†С‹, РїРѕР¶Р°Р»СѓР№СЃС‚Р°, РѕР±СЂР°С‚РёС‚РµСЃСЊ Рє СЂР°Р·СЂР°Р±РѕС‚С‡РёРєСѓ. РЎР°Р№С‚ РёСЃРїРѕР»СЊР·СѓРµС‚ СЃР»РѕР¶РЅСѓСЋ РІРµСЂСЃС‚РєСѓ, РєРѕС‚РѕСЂР°СЏ Р¶РµСЃС‚РєРѕ Р·Р°РґР°РЅР° РІ РєРѕРґРµ РґР»СЏ РІС‹СЃРѕРєРѕР№ РїСЂРѕРёР·РІРѕРґРёС‚РµР»СЊРЅРѕСЃС‚Рё Рё Р°РЅРёРјР°С†РёР№.')} style={{ background: 'none', border: 'none', color: '#3b82f6', cursor: 'pointer' }}>РќР°СЃС‚СЂРѕРёС‚СЊ</button>
                          </div>
                        </div>
                        
                        {/* Subpages */}
                        {page.items && page.items.length > 0 && (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', paddingLeft: '32px', position: 'relative' }}>
                            <div style={{ position: 'absolute', left: '16px', top: '0', bottom: '20px', width: '2px', background: theme === 'white' ? '#e2e8f0' : '#333' }}></div>
                            {page.items.map((sub, subIdx) => (
                              <div key={subIdx} style={{ position: 'relative', padding: '12px 16px', border: theme === 'white' ? '1px solid #e2e8f0' : '1px solid #2a2a2a', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: theme === 'white' ? '#fff' : '#111' }}>
                                <div style={{ position: 'absolute', left: '-16px', top: '50%', width: '16px', height: '2px', background: theme === 'white' ? '#e2e8f0' : '#333' }}></div>
                                <div>
                                  <div style={{ fontWeight: '500', color: theme === 'white' ? '#334155' : '#ccc', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <FileText size={14} color="#64748b" /> {sub.name}
                                  </div>
                                  <div style={{ fontSize: '0.75rem', color: theme === 'white' ? '#94a3b8' : '#666', marginTop: '4px', marginLeft: '22px' }}>
                                    Action: {sub.action?.type} {sub.action?.subpage ? `(${sub.action.subpage})` : ''}
                                  </div>
                                </div>
                                <div style={{ display: 'flex', gap: '10px' }}>
                                  <button onClick={() => alert('SEO РЅР°СЃС‚СЂРѕР№РєРё РґР»СЏ СЌС‚РѕР№ СЃС‚СЂР°РЅРёС†С‹ СЃРєРѕСЂРѕ Р±СѓРґСѓС‚ РґРѕСЃС‚СѓРїРЅС‹ РґР»СЏ СЂРµРґР°РєС‚РёСЂРѕРІР°РЅРёСЏ.')} style={{ background: 'none', border: 'none', color: '#ec4899', cursor: 'pointer', fontSize: '0.85rem' }}>SEO</button>
                                  <button onClick={() => alert('Р”Р»СЏ РёР·РјРµРЅРµРЅРёСЏ РєРѕРЅС‚РµРЅС‚Р° СЌС‚РѕР№ СЃС‚СЂР°РЅРёС†С‹, РїРѕР¶Р°Р»СѓР№СЃС‚Р°, РѕР±СЂР°С‚РёС‚РµСЃСЊ Рє СЂР°Р·СЂР°Р±РѕС‚С‡РёРєСѓ. РЎР°Р№С‚ РёСЃРїРѕР»СЊР·СѓРµС‚ СЃР»РѕР¶РЅСѓСЋ РІРµСЂСЃС‚РєСѓ, РєРѕС‚РѕСЂР°СЏ Р¶РµСЃС‚РєРѕ Р·Р°РґР°РЅР° РІ РєРѕРґРµ РґР»СЏ РІС‹СЃРѕРєРѕР№ РїСЂРѕРёР·РІРѕРґРёС‚РµР»СЊРЅРѕСЃС‚Рё Рё Р°РЅРёРјР°С†РёР№.')} style={{ background: 'none', border: 'none', color: '#3b82f6', cursor: 'pointer', fontSize: '0.85rem' }}>РљРѕРЅС‚РµРЅС‚</button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeAdminSection === 'settings' && (
                <div style={{ background: theme === 'white' ? '#fff' : '#111', border: theme === 'white' ? '1px solid rgba(0,0,0,0.05)' : '1px solid rgba(255,255,255,0.05)', borderRadius: '12px', padding: '30px', boxShadow: theme === 'white' ? '0 4px 20px rgba(0,0,0,0.05)' : 'none' }}>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '20px', color: theme === 'white' ? '#0f172a' : '#fff' }}>Р“Р»РѕР±Р°Р»СЊРЅС‹Рµ РЅР°СЃС‚СЂРѕР№РєРё</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div>
                      <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: theme === 'white' ? '#475569' : '#ccc' }}>РќР°Р·РІР°РЅРёРµ РєРѕРјРїР°РЅРёРё</label>
                      <input type="text" value={adminData.global?.companyName || ''} onChange={e => setAdminData(prev => ({...prev, global: {...prev.global, companyName: e.target.value}}))} style={{ width: '100%', padding: '12px', borderRadius: '6px', border: theme === 'white' ? '1px solid #cbd5e1' : '1px solid #333', background: theme === 'white' ? '#f8fafc' : '#000', color: theme === 'white' ? '#0f172a' : '#fff' }} />
                    </div>
                    <div>
                      <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: theme === 'white' ? '#475569' : '#ccc' }}>РћСЃРЅРѕРІРЅРѕР№ С‚РµР»РµС„РѕРЅ</label>
                      <input type="text" value={adminData.global?.phone || ''} onChange={e => setAdminData(prev => ({...prev, global: {...prev.global, phone: e.target.value}}))} style={{ width: '100%', padding: '12px', borderRadius: '6px', border: theme === 'white' ? '1px solid #cbd5e1' : '1px solid #333', background: theme === 'white' ? '#f8fafc' : '#000', color: theme === 'white' ? '#0f172a' : '#fff' }} />
                    </div>
                    <div>
                      <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: theme === 'white' ? '#475569' : '#ccc' }}>Email РґР»СЏ СѓРІРµРґРѕРјР»РµРЅРёР№</label>
                      <input type="text" value={adminData.global?.email || ''} onChange={e => setAdminData(prev => ({...prev, global: {...prev.global, email: e.target.value}}))} style={{ width: '100%', padding: '12px', borderRadius: '6px', border: theme === 'white' ? '1px solid #cbd5e1' : '1px solid #333', background: theme === 'white' ? '#f8fafc' : '#000', color: theme === 'white' ? '#0f172a' : '#fff' }} />
                    </div>
                    <div>
                      <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: theme === 'white' ? '#475569' : '#ccc' }}>РђРґСЂРµСЃ РјРµСЃС‚РѕРїРѕР»РѕР¶РµРЅРёСЏ</label>
                      <input type="text" value={adminData.global?.address || ''} onChange={e => setAdminData(prev => ({...prev, global: {...prev.global, address: e.target.value}}))} style={{ width: '100%', padding: '12px', borderRadius: '6px', border: theme === 'white' ? '1px solid #cbd5e1' : '1px solid #333', background: theme === 'white' ? '#f8fafc' : '#000', color: theme === 'white' ? '#0f172a' : '#fff' }} />
                    </div>
                    <div>
                      <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: theme === 'white' ? '#475569' : '#ccc' }}>РљРѕРѕСЂРґРёРЅР°С‚С‹ РєР°СЂС‚С‹ (РЁРёСЂРѕС‚Р°, Р”РѕР»РіРѕС‚Р°)</label>
                      <input type="text" placeholder="РќР°РїСЂРёРјРµСЂ: 49.8066, 73.0855" value={adminData.global?.mapCoords || ''} onChange={e => setAdminData(prev => ({...prev, global: {...prev.global, mapCoords: e.target.value}}))} style={{ width: '100%', padding: '12px', borderRadius: '6px', border: theme === 'white' ? '1px solid #cbd5e1' : '1px solid #333', background: theme === 'white' ? '#f8fafc' : '#000', color: theme === 'white' ? '#0f172a' : '#fff' }} />
                      <p style={{ fontSize: '0.8rem', color: '#ef4444', marginTop: '8px' }}>Р’РЅРёРјР°РЅРёРµ: РёР·РјРµРЅРµРЅРёРµ Р°РґСЂРµСЃР° РЅРµ СЃРґРІРёРЅРµС‚ РєР°СЂС‚Сѓ Р°РІС‚РѕРјР°С‚РёС‡РµСЃРєРё. РћР±СЏР·Р°С‚РµР»СЊРЅРѕ РІРїРёС€РёС‚Рµ РєРѕРѕСЂРґРёРЅР°С‚С‹ (РЅР°РїСЂРёРјРµСЂ, 49.8066, 73.0855 РґР»СЏ РљР°СЂР°РіР°РЅРґС‹), РёРЅР°С‡Рµ РєР°СЂС‚Р° РѕСЃС‚Р°РЅРµС‚СЃСЏ РІ РђР»РјР°С‚С‹.</p>
                    </div>
                    <div>
                      <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: theme === 'white' ? '#475569' : '#ccc' }}>ID РЇРЅРґРµРєСЃ РњРµС‚СЂРёРєРё (РЎС‡РµС‚С‡РёРє)</label>
                      <input 
                        type="text" 
                        placeholder="РќР°РїСЂРёРјРµСЂ: 98765432"
                        value={adminData.seo?.yandexMetricaId || ''} 
                        onChange={e => setAdminData(prev => ({...prev, seo: {...prev.seo, yandexMetricaId: e.target.value}}))}
                        style={{ width: '100%', padding: '12px', borderRadius: '6px', border: theme === 'white' ? '1px solid #cbd5e1' : '1px solid #333', background: theme === 'white' ? '#f8fafc' : '#000', color: theme === 'white' ? '#0f172a' : '#fff' }} 
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: theme === 'white' ? '#475569' : '#ccc' }}>Google Analytics (Measurement ID)</label>
                      <input 
                        type="text" 
                        placeholder="РќР°РїСЂРёРјРµСЂ: G-XXXXXXXXXX"
                        value={adminData.seo?.googleAnalyticsId || ''} 
                        onChange={e => setAdminData(prev => ({...prev, seo: {...prev.seo, googleAnalyticsId: e.target.value}}))}
                        style={{ width: '100%', padding: '12px', borderRadius: '6px', border: theme === 'white' ? '1px solid #cbd5e1' : '1px solid #333', background: theme === 'white' ? '#f8fafc' : '#000', color: theme === 'white' ? '#0f172a' : '#fff' }} 
                      />
                    </div>
                    <button onClick={() => saveAdminData()} disabled={isSavingAdmin} style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', color: '#fff', border: 'none', padding: '12px 24px', borderRadius: '8px', cursor: isSavingAdmin ? 'wait' : 'pointer', fontWeight: 'bold', marginTop: '10px', boxShadow: '0 4px 15px rgba(16, 185, 129, 0.3)' }}>
                      {isSavingAdmin ? 'вЏі РЎРѕС…СЂР°РЅРµРЅРёРµ...' : 'рџ’ѕ РЎРѕС…СЂР°РЅРёС‚СЊ Рё СЃРёРЅС…СЂРѕРЅРёР·РёСЂРѕРІР°С‚СЊ РЅР°СЃС‚СЂРѕР№РєРё'}
                    </button>
                  </div>
                </div>
              )}

              
            {activeAdminSection === 'photos' && (
              <div style={{ background: theme === 'white' ? '#fff' : '#111', border: theme === 'white' ? '1px solid rgba(0,0,0,0.05)' : '1px solid rgba(255,255,255,0.05)', borderRadius: '12px', padding: '30px', boxShadow: theme === 'white' ? '0 4px 20px rgba(0,0,0,0.05)' : 'none' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: theme === 'white' ? '#0f172a' : '#fff', marginBottom: '20px' }}>РЈРїСЂР°РІР»РµРЅРёРµ С„РѕС‚РѕРіСЂР°С„РёСЏРјРё (Р‘Р»РѕРєРё РіР»Р°РІРЅРѕР№ СЃС‚СЂР°РЅРёС†С‹)</h3>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
                  
                  {/* РћР±РѕСЂСѓРґРѕРІР°РЅРёРµ Рё С‚РµС…РЅРѕР»РѕРіРёРё */}
                  <div>
                    <h4 style={{ fontSize: '1.1rem', color: 'var(--color-cyan)', marginBottom: '15px', borderBottom: '1px solid rgba(6, 182, 212, 0.2)', paddingBottom: '10px' }}>Р‘Р»РѕРє: РћР±РѕСЂСѓРґРѕРІР°РЅРёРµ Рё С‚РµС…РЅРѕР»РѕРіРёРё (3 РєР°СЂС‚РѕС‡РєРё)</h4>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '15px' }}>
                      <div style={{ padding: '15px', background: theme === 'white' ? '#f8fafc' : '#0a0a0a', borderRadius: '8px', border: theme === 'white' ? '1px solid #cbd5e1' : '1px solid #333' }}>
                        <div style={{ marginBottom: '8px', fontSize: '0.9rem', color: theme === 'white' ? '#334155' : '#ccc' }}>Р‘СѓСЂРѕРІР°СЏ С‚РµС…РЅРёРєР°</div>
                        <ImageUploadField value={adminData.media?.rigBg || ''} onChange={(val) => setAdminData({...adminData, media: {...adminData.media, rigBg: val}})} theme={theme} />
                      </div>
                      <div style={{ padding: '15px', background: theme === 'white' ? '#f8fafc' : '#0a0a0a', borderRadius: '8px', border: theme === 'white' ? '1px solid #cbd5e1' : '1px solid #333' }}>
                        <div style={{ marginBottom: '8px', fontSize: '0.9rem', color: theme === 'white' ? '#334155' : '#ccc' }}>Р›Р°Р±РѕСЂР°С‚РѕСЂРёСЏ РіСЂСѓРЅС‚РѕРІ</div>
                        <ImageUploadField value={adminData.media?.labBg || ''} onChange={(val) => setAdminData({...adminData, media: {...adminData.media, labBg: val}})} theme={theme} />
                      </div>
                      <div style={{ padding: '15px', background: theme === 'white' ? '#f8fafc' : '#0a0a0a', borderRadius: '8px', border: theme === 'white' ? '1px solid #cbd5e1' : '1px solid #333' }}>
                        <div style={{ marginBottom: '8px', fontSize: '0.9rem', color: theme === 'white' ? '#334155' : '#ccc' }}>РРЅР¶РµРЅРµСЂРЅР°СЏ РіРµРѕРґРµР·РёСЏ</div>
                        <ImageUploadField value={adminData.media?.geoBg || ''} onChange={(val) => setAdminData({...adminData, media: {...adminData.media, geoBg: val}})} theme={theme} />
                      </div>
                    </div>
                  </div>

                  {/* Р’С‹РїРѕР»РЅРµРЅРЅС‹Рµ РѕР±СЉРµРєС‚С‹ (РЈСЃР»СѓРіРё) */}
                  <div>
                    <h4 style={{ fontSize: '1.1rem', color: 'var(--color-cyan)', marginBottom: '15px', borderBottom: '1px solid rgba(6, 182, 212, 0.2)', paddingBottom: '10px' }}>Р‘Р»РѕРє: РЈСЃР»СѓРіРё (6 РєР°СЂС‚РѕС‡РµРє РЅР° РіР»Р°РІРЅРѕР№)</h4>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '15px' }}>
                      {['geology', 'geodesy', 'cpt', 'piles', 'plates', 'laboratory'].map((id, idx) => {
                        const service = adminData.services.find(s => s.id === id);
                        const titles = ['РРЅР¶РµРЅРµСЂРЅРѕ-РіРµРѕР»РѕРіРёС‡РµСЃРєРёРµ РёР·С‹СЃРєР°РЅРёСЏ', 'Р“РµРѕРґРµР·РёСЏ Рё С‚РѕРїРѕСЃСЉРµРјРєР°', 'CPT Р—РѕРЅРґРёСЂРѕРІР°РЅРёРµ', 'РСЃРїС‹С‚Р°РЅРёСЏ СЃРІР°Р№', 'РЁС‚Р°РјРїРѕРІС‹Рµ РёСЃРїС‹С‚Р°РЅРёСЏ', 'Р›Р°Р±РѕСЂР°С‚РѕСЂРёСЏ РіСЂСѓРЅС‚РѕРІ'];
                        return (
                          <div key={id} style={{ padding: '15px', background: theme === 'white' ? '#f8fafc' : '#0a0a0a', borderRadius: '8px', border: theme === 'white' ? '1px solid #cbd5e1' : '1px solid #333' }}>
                            <div style={{ marginBottom: '8px', fontSize: '0.9rem', color: theme === 'white' ? '#334155' : '#ccc' }}>{titles[idx]}</div>
                            <ImageUploadField 
                              value={service?.image || ''} 
                              onChange={(val) => {
                                const arr = [...adminData.services];
                                const index = arr.findIndex(s => s.id === id);
                                if(index > -1) { arr[index].image = val; setAdminData({...adminData, services: arr}); }
                              }} 
                              theme={theme} 
                            />
                          </div>
                        )
                      })}
                    </div>
                  </div>

                  {/* Р›РёС†РµРЅР·РёРё Рё СЃРµСЂС‚РёС„РёРєР°С‚С‹ (Р”РёСЂРµРєС‚РѕСЂ) */}
                  <div>
                    <h4 style={{ fontSize: '1.1rem', color: 'var(--color-cyan)', marginBottom: '15px', borderBottom: '1px solid rgba(6, 182, 212, 0.2)', paddingBottom: '10px' }}>Р‘Р»РѕРє: Р›РёС†РµРЅР·РёРё Рё СЃРµСЂС‚РёС„РёРєР°С‚С‹ (Р¤РѕС‚Рѕ РґРёСЂРµРєС‚РѕСЂР°)</h4>
                    <div style={{ padding: '15px', background: theme === 'white' ? '#f8fafc' : '#0a0a0a', borderRadius: '8px', border: theme === 'white' ? '1px solid #cbd5e1' : '1px solid #333', maxWidth: '400px' }}>
                      <div style={{ marginBottom: '8px', fontSize: '0.9rem', color: theme === 'white' ? '#334155' : '#ccc' }}>РЁРµРЅРІРёР·РѕРІ Р СѓРґРѕР»СЊС„ РљРѕРЅСЃС‚Р°РЅС‚РёРЅРѕРІРёС‡</div>
                      <ImageUploadField 
                        value={((adminData.team || []).find(m => (m.name && m.name.toLowerCase().includes('С€РµРЅРІРёР·РѕРІ')) || (m.badge && m.badge.toLowerCase().includes('РѕСЃРЅРѕРІР°С‚РµР»СЊ'))) || adminData.team?.[0])?.img || ''} 
                        onChange={(val) => {
                          const arr = [...(adminData.team || [])];
                          const targetIdx = arr.findIndex(m => (m.name && m.name.toLowerCase().includes('С€РµРЅРІРёР·РѕРІ')) || (m.badge && m.badge.toLowerCase().includes('РѕСЃРЅРѕРІР°С‚РµР»СЊ')));
                          const idxToUse = targetIdx !== -1 ? targetIdx : 0;
                          if (arr.length > 0) {
                              arr[idxToUse].img = val;
                              setAdminData({...adminData, team: arr});
                          }
                        }} 
                        theme={theme} 
                      />
                    </div>
                  </div>

                  <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end' }}>
                    <button 
                      onClick={() => saveAdminData()} 
                      disabled={isSavingAdmin}
                      style={{ 
                        background: 'linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%)', 
                        color: '#fff', 
                        border: 'none', 
                        padding: '12px 28px', 
                        borderRadius: '8px', 
                        cursor: isSavingAdmin ? 'wait' : 'pointer', 
                        fontWeight: 'bold', 
                        fontSize: '1rem',
                        boxShadow: '0 4px 15px rgba(6, 182, 212, 0.4)'
                      }}
                    >
                      {isSavingAdmin ? 'вЏі РЎРѕС…СЂР°РЅРµРЅРёРµ...' : 'рџ’ѕ РЎРѕС…СЂР°РЅРёС‚СЊ С„РѕС‚РѕРіСЂР°С„РёРё Рё СЃРёРЅС…СЂРѕРЅРёР·РёСЂРѕРІР°С‚СЊ'}
                    </button>
                  </div>

                </div>
              </div>
            )}

            {activeAdminSection === 'bot' && (
                <div style={{ background: theme === 'white' ? '#fff' : '#111', border: theme === 'white' ? '1px solid rgba(0,0,0,0.05)' : '1px solid rgba(255,255,255,0.05)', borderRadius: '12px', padding: '30px', boxShadow: theme === 'white' ? '0 4px 20px rgba(0,0,0,0.05)' : 'none' }}>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '20px', color: theme === 'white' ? '#0f172a' : '#fff' }}>РќР°СЃС‚СЂРѕР№РєРё Р§Р°С‚-Р±РѕС‚Р°</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div>
                      <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: theme === 'white' ? '#475569' : '#ccc', fontWeight: 'bold' }}>РРјСЏ Р°СЃСЃРёСЃС‚РµРЅС‚Р°</label>
                      <input type="text" value={adminData.bot.name} onChange={e => setAdminData(prev => ({...prev, bot: {...prev.bot, name: e.target.value}}))} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: theme === 'white' ? '1px solid #cbd5e1' : '1px solid #444', background: theme === 'white' ? '#f8fafc' : '#000', color: theme === 'white' ? '#0f172a' : '#fff', outline: 'none' }} />
                    </div>
                    <div>
                      <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: theme === 'white' ? '#475569' : '#ccc', fontWeight: 'bold' }}>РџСЂРёРІРµС‚СЃС‚РІРµРЅРЅРѕРµ СЃРѕРѕР±С‰РµРЅРёРµ</label>
                      <textarea rows="3" value={adminData.bot.welcomeMsg} onChange={e => setAdminData(prev => ({...prev, bot: {...prev.bot, welcomeMsg: e.target.value}}))} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: theme === 'white' ? '1px solid #cbd5e1' : '1px solid #444', background: theme === 'white' ? '#f8fafc' : '#000', color: theme === 'white' ? '#0f172a' : '#fff', resize: 'vertical', outline: 'none' }}></textarea>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <input type="checkbox" id="bot_active" checked={adminData.bot.active} onChange={e => setAdminData(prev => ({...prev, bot: {...prev.bot, active: e.target.checked}}))} style={{ width: '18px', height: '18px', cursor: 'pointer' }} />
                      <label htmlFor="bot_active" style={{ color: theme === 'white' ? '#0f172a' : '#fff', cursor: 'pointer', fontWeight: 'bold' }}>Р‘РѕС‚ Р°РєС‚РёРІРµРЅ РЅР° СЃР°Р№С‚Рµ</label>
                    </div>
                    
                    <hr style={{ border: 'none', borderTop: theme === 'white' ? '1px solid #e2e8f0' : '1px solid #333', margin: '10px 0' }} />
                    
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <h4 style={{ fontSize: '1.1rem', margin: 0, color: theme === 'white' ? '#0f172a' : '#fff' }}>РЎС†РµРЅР°СЂРёРё РѕС‚РІРµС‚РѕРІ (Intents)</h4>
                      <button onClick={() => setAdminData(prev => ({...prev, bot: {...prev.bot, scenarios: [...prev.bot.scenarios, { id: Date.now().toString(), keywords: '', answer: '' }]}}))} style={{ background: 'var(--color-cyan)', color: '#fff', border: 'none', padding: '6px 14px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.85rem' }}>+ Р”РѕР±Р°РІРёС‚СЊ СЃС†РµРЅР°СЂРёР№</button>
                    </div>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                      {adminData.bot.scenarios.map((scenario, index) => (
                        <div key={scenario.id} style={{ background: theme === 'white' ? '#f1f5f9' : '#1a1a1a', border: theme === 'white' ? '1px solid #e2e8f0' : '1px solid #333', borderRadius: '10px', padding: '20px', position: 'relative' }}>
                          <button onClick={() => { const arr = adminData.bot.scenarios.filter((_, idx) => idx !== index); setAdminData(prev => ({...prev, bot: {...prev.bot, scenarios: arr}})); }} style={{ position: 'absolute', top: '15px', right: '15px', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: 'none', padding: '6px', borderRadius: '6px', cursor: 'pointer' }}><Trash2 size={16} /></button>
                          
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', paddingRight: '40px' }}>
                            <div>
                              <label style={{ display: 'block', fontSize: '0.8rem', color: theme === 'white' ? '#64748b' : '#888', marginBottom: '5px', fontWeight: 'bold' }}>РљР»СЋС‡РµРІС‹Рµ СЃР»РѕРІР° (С‡РµСЂРµР· Р·Р°РїСЏС‚СѓСЋ)</label>
                              <input value={scenario.keywords} onChange={e => { const arr = [...adminData.bot.scenarios]; arr[index].keywords = e.target.value; setAdminData(prev => ({...prev, bot: {...prev.bot, scenarios: arr}})); }} placeholder="РќР°РїСЂРёРјРµСЂ: РїСЂРёРІРµС‚, Р·РґСЂР°РІСЃС‚РІСѓР№, РґРѕР±СЂС‹Р№ РґРµРЅСЊ" style={{ width: '100%', padding: '10px', background: theme === 'white' ? '#fff' : '#000', color: theme === 'white' ? '#0f172a' : '#fff', border: theme === 'white' ? '1px solid #cbd5e1' : '1px solid #444', borderRadius: '6px', outline: 'none' }} />
                            </div>
                            <div>
                              <label style={{ display: 'block', fontSize: '0.8rem', color: theme === 'white' ? '#64748b' : '#888', marginBottom: '5px', fontWeight: 'bold' }}>РћС‚РІРµС‚ Р±РѕС‚Р°</label>
                              <textarea value={scenario.answer} onChange={e => { const arr = [...adminData.bot.scenarios]; arr[index].answer = e.target.value; setAdminData(prev => ({...prev, bot: {...prev.bot, scenarios: arr}})); }} rows={3} style={{ width: '100%', padding: '10px', background: theme === 'white' ? '#fff' : '#000', color: theme === 'white' ? '#0f172a' : '#fff', border: theme === 'white' ? '1px solid #cbd5e1' : '1px solid #444', borderRadius: '6px', resize: 'vertical', outline: 'none' }} />
                            </div>
                          </div>
                        </div>
                      ))}
                      {adminData.bot.scenarios.length === 0 && (
                        <div style={{ textAlign: 'center', padding: '30px', color: theme === 'white' ? '#64748b' : '#888', border: theme === 'white' ? '1px dashed #cbd5e1' : '1px dashed #444', borderRadius: '10px' }}>РќРµС‚ СЃС†РµРЅР°СЂРёРµРІ. Р”РѕР±Р°РІСЊС‚Рµ СЃС†РµРЅР°СЂРёР№, С‡С‚РѕР±С‹ Р±РѕС‚ РјРѕРі РѕС‚РІРµС‡Р°С‚СЊ РЅР° РІРѕРїСЂРѕСЃС‹.</div>
                      )}
                    </div>

                    <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end' }}>
                      <button 
                        onClick={() => saveAdminData()} 
                        disabled={isSavingAdmin}
                        style={{ 
                          background: 'linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%)', 
                          color: '#fff', 
                          border: 'none', 
                          padding: '12px 28px', 
                          borderRadius: '8px', 
                          cursor: isSavingAdmin ? 'wait' : 'pointer', 
                          fontWeight: 'bold', 
                          fontSize: '1rem',
                          boxShadow: '0 4px 15px rgba(6, 182, 212, 0.4)'
                        }}
                      >
                        {isSavingAdmin ? 'вЏі РЎРѕС…СЂР°РЅРµРЅРёРµ...' : 'рџ’ѕ РЎРѕС…СЂР°РЅРёС‚СЊ РЅР°СЃС‚СЂРѕР№РєРё Р±РѕС‚Р°'}
                      </button>
                    </div>

                  </div>
                </div>
              )}

            </div>
          </div>
        )}

      </main>

      {/* Lightbox certificate modals */}
      {certModal && (
        <div className="modal-overlay" onClick={() => setCertModal(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setCertModal(null)}>
              <X size={20} />
            </button>
            <h3 style={{ fontSize: '1.4rem', marginBottom: '15px', color: 'var(--color-accent)' }}>
              {certModal.title}
            </h3>
            <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.95rem', lineHeight: '1.6', marginBottom: '25px' }}>
              {certModal.text}
            </p>
            {certModal.image ? (
              certModal.image.includes('image/') || certModal.image.match(/\.(jpeg|jpg|gif|png|webp)$/i) || certModal.image.startsWith('data:image/') ? (
                 <img src={certModal.image} alt={certModal.title} style={{ width: '100%', maxHeight: '60vh', objectFit: 'contain', borderRadius: '8px', border: '1px solid var(--color-border)' }} />
              ) : (
                 <iframe src={certModal.image} style={{ width: '100%', height: '60vh', border: 'none', borderRadius: '8px', background: '#fff' }} title={certModal.title} />
              )
            ) : (
              <div style={{ border: '1px dashed rgba(251,191,36,0.3)', borderRadius: '8px', padding: '50px 20px', textAlign: 'center', backgroundColor: 'rgba(0,0,0,0.4)' }}>
                <FileText size={48} color="var(--color-accent)" style={{ marginBottom: '12px' }} />
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                  РўРћРћ В«РЎРїРµС†РРЅР¶Р“РµРѕВ» // Р›РР¦Р•РќР—РРЇ_Р“РћРЎ_Р Р•Р•РЎРўР .pdf
                </div>
              </div>
            )}
            <div style={{ marginTop: '25px', display: 'flex', justifyContent: 'flex-end' }}>
              <button className="btn btn-secondary" onClick={() => setCertModal(null)}>
                Р—Р°РєСЂС‹С‚СЊ
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Full-width Map Before Footer */}
      <section style={{ width: '100%', height: '400px', position: 'relative', zIndex: 1, borderTop: '1px solid rgba(6, 182, 212, 0.1)' }}>
        {(() => {
          const getMapCenter = () => {
            if (adminData.global?.mapCoords) {
              const parts = adminData.global.mapCoords.match(/-?\d+\.\d+/g);
              if (parts && parts.length >= 2) return [Number(parts[0]), Number(parts[1])];
            }
            const addr = (adminData.global?.address || '').toLowerCase();
            if (addr.includes('РєР°СЂР°РіР°РЅРґР°')) return [49.8019, 73.1021];
            if (addr.includes('Р°СЃС‚Р°РЅР°') || addr.includes('РЅСѓСЂ-СЃСѓР»С‚Р°РЅ')) return [51.1694, 71.4491];
            if (addr.includes('С€С‹РјРєРµРЅС‚')) return [42.3417, 69.5901];
            if (addr.includes('Р°РєС‚РѕР±Рµ')) return [50.2839, 57.1670];
            if (addr.includes('Р°С‚С‹СЂР°Сѓ')) return [47.1167, 51.8833];
            if (addr.includes('Р°РєС‚Р°Сѓ')) return [43.65, 51.15];
            if (addr.includes('СѓСЃС‚СЊ-РєР°РјРµРЅРѕРіРѕСЂСЃРє')) return [49.9483, 82.6278];
            if (addr.includes('РїР°РІР»РѕРґР°СЂ')) return [52.3, 76.95];
            return [43.2389, 76.8897]; // fallback РђР»РјР°С‚С‹
          };
          const center = getMapCenter();
          return (
            <MapContainer key={`footer-map-${center.join(',')}`} center={center} zoom={13} scrollWheelZoom={false} style={{ height: '100%', width: '100%', background: theme === 'white' ? '#f8fafc' : '#030509' }}>
              <TileLayer
                key={theme}
                url={theme === 'white' ? "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" : "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"}
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              />
              <Marker position={center} icon={customGlowIcon}>
                <Popup className="premium-popup">
              <div style={{ padding: '5px', textAlign: 'center' }}>
                <strong style={{ color: 'var(--color-cyan)', fontSize: '1.1rem' }}>{adminData.global?.companyName || 'РўРћРћ В«РЎРїРµС†РРЅР¶Р“РµРѕВ»'}</strong><br/>
                <span style={{ color: '#aaa' }}>{adminData.global?.address || 'Рі. РђР»РјР°С‚С‹, РїСЂ-С‚ РђР±Р°СЏ, 150'}</span>
              </div>
            </Popup>
          </Marker>
        </MapContainer>
        );
        })()}
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '100px', background: 'linear-gradient(to top, var(--bg-dark), transparent)', pointerEvents: 'none', zIndex: 1000 }}></div>
      </section>

      {/* High-Tech Footer */}
      <footer className="footer">
        <div className="container">
          <div className="footer-grid">
            <div>
              <h3 style={{ color: 'var(--color-text-primary)', marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <img src="/images/logo.png" alt="SpenGeo Logo" style={{ height: '30px', width: 'auto' }} />
                <EditableText id="footer_company_title" defaultText="РўРћРћ В«РЎРїРµС†РРЅР¶Р“РµРѕВ»" isVisualBuilder={isVisualBuilder} />
              </h3>
              <EditableText as="p" id="footer_company_desc" defaultText="РўРћРћ В«РЎРїРµС†РРЅР¶Р“РµРѕВ» вЂ” Р›РёС†РµРЅР·РёСЂРѕРІР°РЅРЅР°СЏ РїСЂРѕРµРєС‚РЅРѕ-РёР·С‹СЃРєР°С‚РµР»СЊСЃРєР°СЏ РѕСЂРіР°РЅРёР·Р°С†РёСЏ. Р“РµРѕР»РѕРіРёСЏ, РіРµРѕРґРµР·РёСЏ, РіСЂСѓРЅС‚РѕРІР°СЏ Р»Р°Р±РѕСЂР°С‚РѕСЂРёСЏ РІРѕ РІСЃРµС… СЂРµРіРёРѕРЅР°С… РљР°Р·Р°С…СЃС‚Р°РЅР°." isVisualBuilder={isVisualBuilder} style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', maxWidth: '400px' }} />
            </div>

            <div>
              <h4 className="footer-title"><EditableText id="footer_links_title" defaultText="Р Р°Р·РґРµР»С‹ СЃР°Р№С‚Р°" isVisualBuilder={isVisualBuilder} /></h4>
              <ul className="footer-links">
                <li><a href="/" onClick={(e) => { e.preventDefault(); setActivePage('home'); logEvent('Footer navigation: Home'); }}>Р“Р»Р°РІРЅР°СЏ</a></li>
                <li><a href="/about" onClick={(e) => { e.preventDefault(); setActivePage('about'); logEvent('Footer navigation: About'); }}>Рћ РєРѕРјРїР°РЅРёРё</a></li>
                <li><a href="/services" onClick={(e) => { e.preventDefault(); setActivePage('services'); logEvent('Footer navigation: Services'); }}>РЈСЃР»СѓРіРё РёР·С‹СЃРєР°РЅРёР№</a></li>
                <li><a href="/projects" onClick={(e) => { e.preventDefault(); setActivePage('projects'); logEvent('Footer navigation: Projects'); }}>РќР°С€Рё РїСЂРѕРµРєС‚С‹</a></li>
              </ul>
            </div>

            <div>
              <h4 className="footer-title"><EditableText id="footer_contacts_title" defaultText="РљРѕРЅС‚Р°РєС‚С‹" isVisualBuilder={isVisualBuilder} /></h4>
              <ul className="footer-links" style={{ fontSize: '0.85rem' }}>
                <li>рџ“Ќ <EditableText id="footer_address" defaultText={adminData.global?.address || 'Р РµСЃРїСѓР±Р»РёРєР° РљР°Р·Р°С…СЃС‚Р°РЅ, Рі. РђР»РјР°С‚С‹'} isVisualBuilder={isVisualBuilder} /></li>
                <li>рџ“ћ <EditableText id="footer_phone" defaultText={adminData.global?.phone || '+7 705 969 0101'} isVisualBuilder={isVisualBuilder} /></li>
                <li>вњ‰пёЏ <EditableText id="footer_email" defaultText={adminData.global?.email || 'info@spengeo.kz'} isVisualBuilder={isVisualBuilder} /></li>
                <li style={{ marginTop: '15px' }}>Р Р°Р·СЂР°Р±РѕС‚Р°РЅРѕ РїСЂРё РїРѕРјРѕС‰Рё <a href="https://codix-style-line-production.up.railway.app/" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--color-cyan)', textDecoration: 'none', textShadow: '0 0 10px rgba(14, 165, 233, 0.5)', borderBottom: '1px dashed var(--color-cyan)', paddingBottom: '2px', fontWeight: 600, letterSpacing: '0.5px', transition: 'all 0.3s' }} onMouseOver={(e) => { e.currentTarget.style.color = '#fff'; e.currentTarget.style.textShadow = '0 0 15px rgba(255, 255, 255, 0.8)'; e.currentTarget.style.borderBottom = '1px solid #fff'; }} onMouseOut={(e) => { e.currentTarget.style.color = 'var(--color-cyan)'; e.currentTarget.style.textShadow = '0 0 10px rgba(14, 165, 233, 0.5)'; e.currentTarget.style.borderBottom = '1px dashed var(--color-cyan)'; }}>Codix Style Line</a></li>
              </ul>
            </div>

    <div className="service-bento-arrow">
      <svg viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: '100%', height: '100%' }}>
        <circle cx="50" cy="50" r="45" strokeDasharray="5 5" />
        <path d="M30 70 L70 30" strokeWidth="4" />
        <path d="M50 30 L70 30 L70 50" strokeWidth="4" />
      </svg>
    </div>
  </div>

          <div className="footer-bottom">
            <div>
              В© 2019-{new Date().getFullYear()} РўРћРћ В«РЎРїРµС†РРЅР¶Р“РµРѕВ». Р›РёС†РµРЅР·РёСЏ в„–19004562.
            </div>
            <div>
              РЎС‚РµРє: React 19 + Golang 1.26 + CSS Blueprint
            </div>
          </div>
        </div>
      </footer>

      {/* Floating Action Buttons */}
      <a href="https://wa.me/77059690101" target="_blank" rel="noopener noreferrer" className="fixed-action-btn whatsapp-btn" title="РќР°РїРёСЃР°С‚СЊ РІ WhatsApp">
        <MessageCircle size={28} />
      </a>

      <button className="fixed-action-btn assistant-btn" title="РР РђСЃСЃРёСЃС‚РµРЅС‚" onClick={() => setIsAssistantOpen(!isAssistantOpen)}>
        {isAssistantOpen ? <X size={28} /> : <Bot size={28} />}
      </button>

      <button 
        className={`fixed-action-btn scroll-top-btn ${showScrollTop ? 'visible' : ''}`} 
        onClick={scrollToTop}
        title="РќР°РІРµСЂС…"
      >
        <ArrowUp size={24} />
      </button>

      {/* AI Assistant Chat Modal */}
      {isAssistantOpen && (
        <div style={{
          position: 'fixed',
          bottom: '100px',
          right: '30px',
          width: '350px',
          backgroundColor: 'var(--bg-card)',
          backdropFilter: 'blur(15px)',
          border: '1px solid var(--color-cyan)',
          borderRadius: '16px',
          boxShadow: '0 10px 40px rgba(0,0,0,0.15), 0 0 20px rgba(6, 182, 212, 0.2)',
          zIndex: 9999,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          animation: 'fade-in 0.3s ease-out'
        }}>
          <div style={{ backgroundColor: 'var(--border-accent)', padding: '15px 20px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Bot size={20} color="var(--color-cyan)" />
              <span style={{ color: 'var(--color-text-primary)', fontWeight: 'bold', fontSize: '1rem' }}>SpenGeo AI</span>
            </div>
            <button onClick={() => setIsAssistantOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--color-text-secondary)', cursor: 'pointer' }}>
              <X size={20} />
            </button>
          </div>
          
          <div style={{ height: '300px', overflowY: 'auto', padding: '15px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {assistantMsgs.map((msg, idx) => (
              <div key={idx} style={{ alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start', maxWidth: '85%' }}>
                <div style={{
                  padding: '10px 14px',
                  borderRadius: '12px',
                  backgroundColor: msg.sender === 'user' ? 'var(--color-cyan)' : 'var(--bg-dark-secondary)',
                  color: msg.sender === 'user' ? '#fff' : 'var(--color-text-primary)',
                  fontSize: '0.9rem',
                  lineHeight: '1.4',
                  borderBottomRightRadius: msg.sender === 'user' ? '2px' : '12px',
                  borderBottomLeftRadius: msg.sender === 'ai' ? '2px' : '12px',
                }}>
                  {msg.text}
                </div>
              </div>
            ))}
          </div>

          <form onSubmit={handleAssistantSend} style={{ display: 'flex', padding: '10px', borderTop: '1px solid var(--border-color)' }}>
            <input 
              type="text" 
              value={assistantInput}
              onChange={(e) => setAssistantInput(e.target.value)}
              placeholder="Р’РІРµРґРёС‚Рµ СЃРѕРѕР±С‰РµРЅРёРµ..."
              style={{ flex: 1, backgroundColor: 'var(--bg-dark)', border: '1px solid var(--border-color)', borderRadius: '20px', padding: '10px 15px', color: 'var(--color-text-primary)', outline: 'none', fontSize: '0.9rem' }}
            />
            <button type="submit" style={{ background: 'none', border: 'none', color: 'var(--color-cyan)', padding: '0 10px', cursor: 'pointer' }}>
              <MessageCircle size={20} />
            </button>
          </form>
        </div>
      )}

      {/* PROFESSIONAL VISUAL BUILDER PANELS */}
      {isVisualBuilder && (
        <>
          {/* Top Panel */}
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, height: '60px', background: '#0a0a0a', borderBottom: '1px solid #222', zIndex: 10000, display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 20px', color: '#fff', boxShadow: '0 4px 20px rgba(0,0,0,0.5)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              <div style={{ background: 'linear-gradient(45deg, var(--color-cyan), var(--color-accent))', padding: '6px', borderRadius: '8px' }}>
                <Edit3 size={18} color="#000" />
              </div>
              <span style={{ fontWeight: 'bold', letterSpacing: '1px', fontSize: '1.1rem' }}>SPENGEO BUILDER</span>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: '#1a1a1a', padding: '6px 16px', borderRadius: '8px', border: '1px solid #333' }}>
                <span style={{ fontSize: '0.85rem', color: '#888' }}>РЎС‚СЂР°РЅРёС†Р°:</span>
                <select 
                  value={activePage} 
                  onChange={(e) => setActivePage(e.target.value)}
                  style={{ background: 'transparent', border: 'none', color: '#fff', outline: 'none', fontWeight: 'bold', cursor: 'pointer', fontSize: '0.9rem' }}
                >
                  {dynamicMenu.ru.map(m => (
                    <option key={m.page} value={m.page} style={{ background: '#111' }}>{m.title}</option>
                  ))}
                </select>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              <button className="btn btn-secondary" onClick={() => setIsVisualBuilder(false)} style={{ padding: '8px 16px', fontSize: '0.85rem', border: '1px solid #444', color: '#ccc' }}>
                Р’С‹Р№С‚Рё
              </button>
              <button 
                className="btn btn-primary" 
                onClick={async () => {
                  await saveAdminData();
                  setIsVisualBuilder(false);
                }} 
                disabled={isSavingAdmin}
                style={{ padding: '8px 20px', fontSize: '0.85rem', display: 'flex', gap: '8px', alignItems: 'center', background: 'var(--color-cyan)', color: '#000', fontWeight: 'bold', cursor: isSavingAdmin ? 'wait' : 'pointer' }}
              >
                <Check size={16} /> {isSavingAdmin ? 'РџСѓР±Р»РёРєР°С†РёСЏ РЅР° СЃРµСЂРІРµСЂ...' : 'РћРїСѓР±Р»РёРєРѕРІР°С‚СЊ'}
              </button>
            </div>
          </div>

          {/* Left Panel */}
          <div style={{ position: 'fixed', top: '60px', left: 0, bottom: 0, width: '300px', background: '#0a0a0a', borderRight: '1px solid #222', zIndex: 10000, display: 'flex', flexDirection: 'column', boxShadow: '4px 0 20px rgba(0,0,0,0.5)' }}>
            <div style={{ padding: '20px', borderBottom: '1px solid #222', fontSize: '0.8rem', fontWeight: 'bold', color: '#888', textTransform: 'uppercase', letterSpacing: '1.5px' }}>
              РЎР»РѕРё Рё Р‘Р»РѕРєРё
            </div>
            <div style={{ padding: '20px', flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {['Top Navigation', 'Hero Section', 'Features Grid', 'About Company', 'Services Tabs', 'Projects Filter', 'Call to Action', 'Footer'].map((layer, i) => (
                <div key={i} style={{ padding: '12px 16px', background: '#111', border: '1px solid #222', borderRadius: '8px', fontSize: '0.85rem', color: '#ccc', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', transition: 'all 0.2s' }} onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--color-cyan)'; e.currentTarget.style.background = '#1a1a1a'; }} onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#222'; e.currentTarget.style.background = '#111'; }}>
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <Layers size={14} color={i === 1 ? 'var(--color-cyan)' : '#666'} /> 
                    <span style={{ color: i === 1 ? '#fff' : '#ccc', fontWeight: i === 1 ? 'bold' : 'normal' }}>{layer}</span>
                  </div>
                  <Eye size={14} color={i === 1 ? 'var(--color-cyan)' : '#444'} />
                </div>
              ))}
            </div>
            <div style={{ padding: '20px', borderTop: '1px solid #222' }}>
              <button className="btn btn-secondary" style={{ width: '100%', fontSize: '0.85rem', border: '1px dashed #444', color: '#aaa', padding: '10px' }}>
                + Р”РѕР±Р°РІРёС‚СЊ Р±Р»РѕРє
              </button>
            </div>
          </div>

          {/* Right Panel */}
          <div style={{ position: 'fixed', top: '60px', right: 0, bottom: 0, width: '300px', background: '#0a0a0a', borderLeft: '1px solid #222', zIndex: 10000, display: 'flex', flexDirection: 'column', boxShadow: '-4px 0 20px rgba(0,0,0,0.5)' }}>
            <div style={{ padding: '20px', borderBottom: '1px solid #222', fontSize: '0.8rem', fontWeight: 'bold', color: '#888', textTransform: 'uppercase', letterSpacing: '1.5px' }}>
              РЎРІРѕР№СЃС‚РІР° СЌР»РµРјРµРЅС‚Р°
            </div>
            <div style={{ padding: '20px', flex: 1, overflowY: 'auto' }}>
              {activeEditorElement ? (
                <>
                  <div style={{ marginBottom: '25px' }}>
                    <label style={{ display: 'block', fontSize: '0.75rem', color: '#666', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '1px' }}>Р’С‹Р±СЂР°РЅРЅС‹Р№ СЌР»РµРјРµРЅС‚</label>
                    <div style={{ padding: '12px', background: 'rgba(6, 182, 212, 0.05)', border: '1px solid rgba(6, 182, 212, 0.2)', borderRadius: '8px', color: 'var(--color-cyan)', fontSize: '0.85rem', display: 'inline-flex', alignItems: 'center', gap: '8px', fontWeight: 'bold' }}>
                      <Edit3 size={14} /> #{activeEditorElement}
                    </div>
                  </div>
                  
                  <div style={{ marginBottom: '25px' }}>
                    <label style={{ display: 'block', fontSize: '0.75rem', color: '#666', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '1px' }}>РўРµРєСЃС‚ (HTML)</label>
                    <textarea 
                      rows="6" 
                      style={{ width: '100%', background: '#111', border: '1px solid #333', borderRadius: '8px', color: '#fff', padding: '12px', fontSize: '0.9rem', lineHeight: '1.5', outline: 'none' }} 
                      value={activeEditorText}
                      onChange={(e) => {
                        setActiveEditorText(e.target.value);
                        window.dispatchEvent(new CustomEvent('vb_update', { detail: { id: activeEditorElement, text: e.target.value } }));
                      }}
                      onFocus={(e) => e.target.style.borderColor = 'var(--color-cyan)'} 
                      onBlur={(e) => e.target.style.borderColor = '#333'} 
                    />
                  </div>
                </>
              ) : (
                <div style={{ padding: '20px', color: '#666', textAlign: 'center', fontSize: '0.9rem', lineHeight: '1.6' }}>
                  РљР»РёРєРЅРёС‚Рµ РЅР° Р»СЋР±РѕР№ РїСѓРЅРєС‚РёСЂРЅС‹Р№ С‚РµРєСЃС‚РѕРІС‹Р№ Р±Р»РѕРє РЅР° СЃР°Р№С‚Рµ, С‡С‚РѕР±С‹ РЅР°С‡Р°С‚СЊ РµРіРѕ СЂРµРґР°РєС‚РёСЂРѕРІР°РЅРёРµ.
                </div>
              )}

              <div style={{ marginBottom: '25px' }}>
                <label style={{ display: 'block', fontSize: '0.75rem', color: '#666', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '1px' }}>РћС‚СЃС‚СѓРїС‹ (Margin / Padding)</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <input type="text" placeholder="Margin (px)" style={{ background: '#111', border: '1px solid #333', borderRadius: '8px', color: '#fff', padding: '10px', fontSize: '0.85rem', outline: 'none' }} onFocus={(e) => e.target.style.borderColor = 'var(--color-cyan)'} onBlur={(e) => e.target.style.borderColor = '#333'} />
                  <input type="text" placeholder="Padding (px)" style={{ background: '#111', border: '1px solid #333', borderRadius: '8px', color: '#fff', padding: '10px', fontSize: '0.85rem', outline: 'none' }} onFocus={(e) => e.target.style.borderColor = 'var(--color-cyan)'} onBlur={(e) => e.target.style.borderColor = '#333'} />
                </div>
              </div>
              
              <div style={{ marginBottom: '25px' }}>
                <label style={{ display: 'block', fontSize: '0.75rem', color: '#666', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '1px' }}>РўРёРїРѕРіСЂР°С„РёРєР°</label>
                <select style={{ width: '100%', background: '#111', border: '1px solid #333', borderRadius: '8px', color: '#fff', padding: '10px', fontSize: '0.85rem', marginBottom: '12px', outline: 'none', appearance: 'none', cursor: 'pointer' }}>
                  <option>Display Font (Unbounded)</option>
                  <option>Body Font (Inter)</option>
                  <option>Mono Font (JetBrains)</option>
                </select>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <input type="text" defaultValue="3.5rem" style={{ flex: 1, background: '#111', border: '1px solid #333', borderRadius: '8px', color: '#fff', padding: '10px', fontSize: '0.85rem', outline: 'none' }} onFocus={(e) => e.target.style.borderColor = 'var(--color-cyan)'} onBlur={(e) => e.target.style.borderColor = '#333'} />
                  <input type="text" defaultValue="800" style={{ width: '80px', background: '#111', border: '1px solid #333', borderRadius: '8px', color: '#fff', padding: '10px', fontSize: '0.85rem', outline: 'none', textAlign: 'center' }} onFocus={(e) => e.target.style.borderColor = 'var(--color-cyan)'} onBlur={(e) => e.target.style.borderColor = '#333'} />
                </div>
              </div>

              <div style={{ marginBottom: '25px' }}>
                <label style={{ display: 'block', fontSize: '0.75rem', color: '#666', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '1px' }}>Р¦РІРµС‚</label>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <div style={{ width: '30px', height: '30px', background: 'var(--color-text-primary)', borderRadius: '6px', border: '1px solid #444' }}></div>
                  <input type="text" defaultValue="var(--color-text-primary)" style={{ flex: 1, background: '#111', border: '1px solid #333', borderRadius: '8px', color: '#fff', padding: '10px', fontSize: '0.85rem', outline: 'none' }} />
                </div>
              </div>
            </div>
            <div style={{ padding: '20px', borderTop: '1px solid #222' }}>
              <button className="btn btn-secondary" style={{ width: '100%', fontSize: '0.85rem', border: '1px solid #333', background: '#111', color: '#ef4444', padding: '10px' }}>
                <Trash2 size={14} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '5px' }} /> РЈРґР°Р»РёС‚СЊ Р±Р»РѕРє
              </button>
            </div>
          </div>
        </>
      )}

      </div>
      </div>

      {/* ==================== MODAL: ACTIVE ARTICLE ==================== */}
      {activeArticle && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.85)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px', backdropFilter: 'blur(5px)' }} onClick={() => setActiveArticle(null)}>
          <div style={{ background: theme === 'white' ? '#fff' : '#0f172a', border: theme === 'white' ? '1px solid #cbd5e1' : '1px solid rgba(6, 182, 212, 0.3)', borderRadius: '12px', width: '100%', maxWidth: '800px', maxHeight: '90vh', overflowY: 'auto', position: 'relative', boxShadow: '0 20px 50px rgba(0,0,0,0.5)' }} onClick={e => e.stopPropagation()}>
            
            <button onClick={() => setActiveArticle(null)} style={{ position: 'absolute', top: '20px', right: '20px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', width: '36px', height: '36px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10, transition: 'background 0.2s', backdropFilter: 'blur(4px)' }} onMouseOver={(e) => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.8)'} onMouseOut={(e) => e.currentTarget.style.background = 'rgba(0,0,0,0.3)'}>
              <X size={20} />
            </button>

            {activeArticle.image && (
              <div style={{ width: '100%', height: '350px', position: 'relative' }}>
                <img src={activeArticle.image} alt={activeArticle.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '150px', background: `linear-gradient(to top, ${theme === 'white' ? '#fff' : '#0f172a'} 20%, transparent)` }}></div>
              </div>
            )}
            
            <div style={{ padding: '40px', marginTop: activeArticle.image ? '-60px' : '0', position: 'relative', zIndex: 2 }}>
              <div style={{ display: 'flex', gap: '15px', fontSize: '0.85rem', color: '#06b6d4', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '15px' }}>
                <span>{activeArticle.category}</span>
                <span style={{ color: theme === 'white' ? '#cbd5e1' : '#334155' }}>вЂў</span>
                <span style={{ color: theme === 'white' ? '#64748b' : '#94a3b8' }}>{activeArticle.date}</span>
              </div>
              <h2 style={{ fontSize: '2.5rem', marginBottom: '30px', color: theme === 'white' ? '#0f172a' : '#f8fafc', lineHeight: '1.2' }}>{activeArticle.title}</h2>
              
              <div style={{ fontSize: '1.1rem', color: theme === 'white' ? '#334155' : '#cbd5e1', lineHeight: '1.8', whiteSpace: 'pre-wrap' }}>
                {activeArticle.content || activeArticle.excerpt || "РўРµРєСЃС‚ СЃС‚Р°С‚СЊРё РІ РїСЂРѕС†РµСЃСЃРµ РЅР°РїРёСЃР°РЅРёСЏ."}
              </div>
            </div>
          </div>
        </div>
      )}

    </>
  );
}

export default App;
