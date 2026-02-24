/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { 
  CloudRain, 
  Waves, 
  Mountain, 
  Satellite, 
  Cpu, 
  History, 
  Upload, 
  Send, 
  CheckCircle2, 
  AlertCircle, 
  FileJson, 
  FileSpreadsheet,
  X,
  ChevronDown,
  ChevronUp,
  Database
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Papa from 'papaparse';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface FormData {
  // Meteorological
  rainfall_intensity: string;
  rainfall_accumulation: string;
  temperature: string;
  humidity: string;
  wind_speed: string;
  // Hydrological
  river_level: string;
  river_discharge: string;
  soil_moisture: string;
  groundwater_level: string;
  // Topographical
  elevation: string;
  slope: string;
  land_use: string;
  soil_type: string;
  // Remote Sensing
  sat_rainfall: string;
  sat_soil_moisture: string;
  drone_image: string;
  // IoT Sensor
  iot_river_level: string;
  iot_river_flow: string;
  iot_temp: string;
  iot_humidity: string;
  iot_wind: string;
  // Historical
  past_flood: string;
  flood_severity: string;
  flood_duration: string;
}

const initialData: FormData = {
  rainfall_intensity: '',
  rainfall_accumulation: '',
  temperature: '',
  humidity: '',
  wind_speed: '',
  river_level: '',
  river_discharge: '',
  soil_moisture: '',
  groundwater_level: '',
  elevation: '',
  slope: '',
  land_use: '',
  soil_type: '',
  sat_rainfall: '',
  sat_soil_moisture: '',
  drone_image: '',
  iot_river_level: '',
  iot_river_flow: '',
  iot_temp: '',
  iot_humidity: '',
  iot_wind: '',
  past_flood: 'no',
  flood_severity: '',
  flood_duration: '',
};

export default function App() {
  const [formData, setFormData] = useState<FormData>(initialData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'sending' | 'success'>('idle');
  const [importMode, setImportMode] = useState<'manual' | 'file'>('manual');
  const [showPreview, setShowPreview] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    const newErrors: string[] = [];
    const requiredFields: (keyof FormData)[] = [
      'rainfall_intensity', 'temperature', 'river_level', 'elevation', 'land_use'
    ];
    
    requiredFields.forEach(field => {
      if (!formData[field]) {
        newErrors.push(`${field.replace(/_/g, ' ')} is required`);
      }
    });

    setErrors(newErrors);
    return newErrors.length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    setSubmitStatus('sending');

    // Simulate 5 second delay
    await new Promise(resolve => setTimeout(resolve, 5000));

    setSubmitStatus('success');
    setIsSubmitting(false);

    // Re-enable after a while or keep success message
    setTimeout(() => {
      setSubmitStatus('idle');
    }, 5000);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    const extension = file.name.split('.').pop()?.toLowerCase();

    if (extension === 'json') {
      reader.onload = (event) => {
        try {
          const json = JSON.parse(event.target?.result as string);
          // Map JSON keys to form data (handling potential snake_case vs camelCase if needed)
          const mappedData = { ...initialData };
          Object.keys(json).forEach(key => {
            if (key in initialData) {
              (mappedData as any)[key] = String(json[key]);
            }
          });
          setFormData(mappedData);
          setErrors([]);
        } catch (err) {
          setErrors(['Invalid JSON file format']);
        }
      };
      reader.readAsText(file);
    } else if (extension === 'csv') {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          if (results.data && results.data.length > 0) {
            const row = results.data[0] as any;
            const mappedData = { ...initialData };
            Object.keys(row).forEach(key => {
              if (key in initialData) {
                (mappedData as any)[key] = String(row[key]);
              }
            });
            setFormData(mappedData);
            setErrors([]);
          } else {
            setErrors(['CSV file is empty or invalid']);
          }
        },
        error: () => {
          setErrors(['Error parsing CSV file']);
        }
      });
    } else {
      setErrors(['Unsupported file type. Please use JSON or CSV.']);
    }
  };

  const Section = ({ title, icon: Icon, children, id }: { title: string, icon: any, children: React.ReactNode, id: string }) => (
    <div id={id} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden mb-6">
      <div className="bg-slate-50 px-6 py-4 border-bottom border-slate-200 flex items-center gap-3">
        <div className="p-2 bg-white rounded-lg shadow-sm border border-slate-100">
          <Icon className="w-5 h-5 text-indigo-600" />
        </div>
        <h3 className="font-semibold text-slate-800">{title}</h3>
      </div>
      <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {children}
      </div>
    </div>
  );

  const InputField = ({ label, name, type = "number", placeholder, required = false }: { label: string, name: keyof FormData, type?: string, placeholder?: string, required?: boolean }) => (
    <div className="space-y-1.5">
      <label className="text-sm font-medium text-slate-700 flex items-center gap-1">
        {label}
        {required && <span className="text-rose-500">*</span>}
      </label>
      <input
        type={type}
        name={name}
        value={formData[name]}
        onChange={handleInputChange}
        placeholder={placeholder}
        className={cn(
          "w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all",
          errors.some(e => e.toLowerCase().includes(name.replace(/_/g, ' '))) && "border-rose-300 bg-rose-50"
        )}
      />
    </div>
  );

  const SelectField = ({ label, name, options, required = false }: { label: string, name: keyof FormData, options: { value: string, label: string }[], required?: boolean }) => (
    <div className="space-y-1.5">
      <label className="text-sm font-medium text-slate-700 flex items-center gap-1">
        {label}
        {required && <span className="text-rose-500">*</span>}
      </label>
      <div className="relative">
        <select
          name={name}
          value={formData[name]}
          onChange={handleInputChange}
          className={cn(
            "w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 appearance-none focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all",
            errors.some(e => e.toLowerCase().includes(name.replace(/_/g, ' '))) && "border-rose-300 bg-rose-50"
          )}
        >
          <option value="">Select option</option>
          {options.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-indigo-100 selection:text-indigo-900">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200">
              <Waves className="text-white w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">FlashFlood AI</h1>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Forecasting System</p>
            </div>
          </div>
          
          <div className="hidden md:flex items-center gap-4">
            <button 
              onClick={() => setImportMode(importMode === 'manual' ? 'file' : 'manual')}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-600 hover:text-indigo-600 hover:bg-slate-50 rounded-lg transition-colors"
            >
              {importMode === 'manual' ? <Upload className="w-4 h-4" /> : <Database className="w-4 h-4" />}
              {importMode === 'manual' ? 'Switch to File Import' : 'Switch to Manual Input'}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="max-w-4xl mx-auto">
          {/* Hero Section */}
          <div className="mb-10">
            <h2 className="text-3xl font-bold text-slate-900 mb-2">Flash Flood Data Input</h2>
            <p className="text-slate-600 max-w-2xl">
              Enter meteorological, hydrological, topographical, remote sensing, IoT, and historical data to generate high-precision flood predictions.
            </p>
          </div>

          {/* Mode Toggler (Mobile) */}
          <div className="md:hidden mb-6 flex bg-white p-1 rounded-xl border border-slate-200 shadow-sm">
            <button 
              onClick={() => setImportMode('manual')}
              className={cn(
                "flex-1 py-2 text-sm font-medium rounded-lg transition-all",
                importMode === 'manual' ? "bg-indigo-600 text-white shadow-md" : "text-slate-600 hover:bg-slate-50"
              )}
            >
              Manual
            </button>
            <button 
              onClick={() => setImportMode('file')}
              className={cn(
                "flex-1 py-2 text-sm font-medium rounded-lg transition-all",
                importMode === 'file' ? "bg-indigo-600 text-white shadow-md" : "text-slate-600 hover:bg-slate-50"
              )}
            >
              File Import
            </button>
          </div>

          {/* Error Banner */}
          <AnimatePresence>
            {errors.length > 0 && (
              <motion.div 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="mb-8 p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-start gap-3"
              >
                <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-semibold text-rose-900">Validation Errors</h4>
                  <ul className="mt-1 text-sm text-rose-700 list-disc list-inside">
                    {errors.map((err, i) => <li key={i}>{err}</li>)}
                  </ul>
                </div>
                <button onClick={() => setErrors([])} className="ml-auto text-rose-400 hover:text-rose-600">
                  <X className="w-4 h-4" />
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* File Import Mode */}
          {importMode === 'file' && (
            <div className="mb-10">
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="group relative border-2 border-dashed border-slate-300 rounded-3xl p-12 text-center hover:border-indigo-400 hover:bg-indigo-50/30 transition-all cursor-pointer"
              >
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileUpload} 
                  accept=".json,.csv" 
                  className="hidden" 
                />
                <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <Upload className="w-8 h-8 text-slate-400 group-hover:text-indigo-500" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-1">Upload Data File</h3>
                <p className="text-slate-500 text-sm mb-6">Drag and drop your JSON or CSV file here, or click to browse</p>
                
                <div className="flex items-center justify-center gap-4">
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-600">
                    <FileJson className="w-4 h-4 text-amber-500" /> JSON
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-600">
                    <FileSpreadsheet className="w-4 h-4 text-emerald-500" /> CSV
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-8">
            <Section id="meteorological" title="Meteorological Data" icon={CloudRain}>
              <InputField label="Rainfall Intensity (mm/h)" name="rainfall_intensity" required />
              <InputField label="Rainfall Accumulation (mm)" name="rainfall_accumulation" />
              <InputField label="Temperature (°C)" name="temperature" required />
              <InputField label="Humidity (%)" name="humidity" />
              <InputField label="Wind Speed (m/s)" name="wind_speed" />
            </Section>

            <Section id="hydrological" title="Hydrological Data" icon={Waves}>
              <InputField label="River Water Level (m)" name="river_level" required />
              <InputField label="River Discharge (m³/s)" name="river_discharge" />
              <InputField label="Soil Moisture (%)" name="soil_moisture" />
              <InputField label="Groundwater Level (m)" name="groundwater_level" />
            </Section>

            <Section id="topographical" title="Topographical Data" icon={Mountain}>
              <InputField label="Elevation (m)" name="elevation" required />
              <InputField label="Slope (%)" name="slope" />
              <SelectField 
                label="Land Use / Land Cover" 
                name="land_use" 
                required
                options={[
                  { value: 'urban', label: 'Urban' },
                  { value: 'agriculture', label: 'Agriculture' },
                  { value: 'forest', label: 'Forest' },
                  { value: 'barren', label: 'Barren' },
                ]} 
              />
              <SelectField 
                label="Soil Type" 
                name="soil_type" 
                options={[
                  { value: 'clay', label: 'Clay' },
                  { value: 'sand', label: 'Sand' },
                  { value: 'silt', label: 'Silt' },
                  { value: 'loam', label: 'Loam' },
                ]} 
              />
            </Section>

            <Section id="remote-sensing" title="Remote Sensing Data" icon={Satellite}>
              <InputField label="Satellite Rainfall (mm/h)" name="sat_rainfall" />
              <InputField label="Satellite Soil Moisture (%)" name="sat_soil_moisture" />
              <InputField label="Drone Imagery URL" name="drone_image" type="text" placeholder="https://..." />
            </Section>

            <Section id="iot" title="IoT Sensor Data" icon={Cpu}>
              <InputField label="Gauge Water Level (m)" name="iot_river_level" />
              <InputField label="Gauge Flow Rate (m³/s)" name="iot_river_flow" />
              <InputField label="Station Temp (°C)" name="iot_temp" />
              <InputField label="Station Humidity (%)" name="iot_humidity" />
              <InputField label="Station Wind (m/s)" name="iot_wind" />
            </Section>

            <Section id="historical" title="Historical Data" icon={History}>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700">Past Flood Event</label>
                <div className="flex gap-4 p-2 bg-slate-50 border border-slate-200 rounded-xl">
                  <label className="flex-1 flex items-center justify-center gap-2 py-1 px-3 rounded-lg cursor-pointer transition-all hover:bg-white">
                    <input 
                      type="radio" 
                      name="past_flood" 
                      value="yes" 
                      checked={formData.past_flood === 'yes'} 
                      onChange={handleInputChange}
                      className="accent-indigo-600"
                    />
                    <span className="text-sm font-medium text-slate-700">Yes</span>
                  </label>
                  <label className="flex-1 flex items-center justify-center gap-2 py-1 px-3 rounded-lg cursor-pointer transition-all hover:bg-white">
                    <input 
                      type="radio" 
                      name="past_flood" 
                      value="no" 
                      checked={formData.past_flood === 'no'} 
                      onChange={handleInputChange}
                      className="accent-indigo-600"
                    />
                    <span className="text-sm font-medium text-slate-700">No</span>
                  </label>
                </div>
              </div>
              <SelectField 
                label="Flood Severity" 
                name="flood_severity" 
                options={[
                  { value: 'low', label: 'Low' },
                  { value: 'moderate', label: 'Moderate' },
                  { value: 'high', label: 'High' },
                ]} 
              />
              <InputField label="Flood Duration (hours)" name="flood_duration" />
            </Section>

            {/* JSON Preview Toggler */}
            <div className="flex justify-center">
              <button 
                type="button"
                onClick={() => setShowPreview(!showPreview)}
                className="text-sm font-medium text-slate-500 hover:text-indigo-600 flex items-center gap-2 transition-colors"
              >
                {showPreview ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                {showPreview ? 'Hide Data Preview' : 'Show Data Preview'}
              </button>
            </div>

            {/* JSON Preview */}
            <AnimatePresence>
              {showPreview && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="bg-slate-900 rounded-2xl p-6 font-mono text-xs text-indigo-300 shadow-inner">
                    <div className="flex justify-between items-center mb-4 pb-4 border-b border-slate-800">
                      <span className="text-slate-400 uppercase tracking-widest">Payload Preview</span>
                      <span className="px-2 py-1 bg-slate-800 rounded text-slate-500">JSON</span>
                    </div>
                    <pre className="overflow-x-auto">
                      {JSON.stringify(formData, null, 2)}
                    </pre>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Submit Area */}
            <div className="pt-6 border-t border-slate-200 sticky bottom-0 bg-slate-50/80 backdrop-blur-md pb-10 z-20">
              <div className="flex flex-col items-center gap-4">
                <button
                  type="submit"
                  disabled={isSubmitting || submitStatus === 'success'}
                  className={cn(
                    "w-full max-w-md py-4 rounded-2xl font-bold text-lg flex items-center justify-center gap-3 transition-all shadow-xl",
                    submitStatus === 'idle' && "bg-indigo-600 text-white hover:bg-indigo-700 hover:-translate-y-1 active:translate-y-0 shadow-indigo-200",
                    submitStatus === 'sending' && "bg-slate-200 text-slate-500 cursor-not-allowed",
                    submitStatus === 'success' && "bg-emerald-500 text-white shadow-emerald-200"
                  )}
                >
                  {submitStatus === 'idle' && (
                    <>
                      <Send className="w-5 h-5" />
                      Send Data
                    </>
                  )}
                  {submitStatus === 'sending' && (
                    <>
                      <div className="w-5 h-5 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" />
                      Sending data...
                    </>
                  )}
                  {submitStatus === 'success' && (
                    <>
                      <CheckCircle2 className="w-5 h-5" />
                      Data successfully sent
                    </>
                  )}
                </button>
                
                <AnimatePresence>
                  {submitStatus === 'success' && (
                    <motion.p 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-sm font-medium text-emerald-600 bg-emerald-50 px-4 py-2 rounded-full border border-emerald-100"
                    >
                      Sent to 192.168.137.46
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </form>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <Waves className="w-5 h-5 text-indigo-600" />
            <span className="font-bold text-slate-900">FlashFlood AI</span>
          </div>
          <p className="text-slate-500 text-sm">
            © 2026 AI-Enabled Flash Flood Forecasting System. All rights reserved.
          </p>
          <div className="flex gap-6">
            <a href="#" className="text-sm font-medium text-slate-500 hover:text-indigo-600 transition-colors">Documentation</a>
            <a href="#" className="text-sm font-medium text-slate-500 hover:text-indigo-600 transition-colors">API Status</a>
            <a href="#" className="text-sm font-medium text-slate-500 hover:text-indigo-600 transition-colors">Support</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
