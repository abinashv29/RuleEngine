import React, { useState, useEffect } from 'react';
import { TimeLimit } from '../types/rules';
import { Clock, Calendar } from 'lucide-react';

interface TimeLimitInputProps {
  timeLimit: TimeLimit;
  onChange: (timeLimit: TimeLimit) => void;
}

interface DateTimeParts {
  day: string;
  month: string;
  year: string;
  hours: string;
  minutes: string;
}

const getDateTimeParts = (isoString: string): DateTimeParts => {
  const date = new Date(isoString);
  return {
    day: String(date.getDate()).padStart(2, '0'),
    month: String(date.getMonth() + 1).padStart(2, '0'),
    year: String(date.getFullYear()),
    hours: String(date.getHours()).padStart(2, '0'),
    minutes: String(date.getMinutes()).padStart(2, '0'),
  };
};

export default function TimeLimitInput({ timeLimit, onChange }: TimeLimitInputProps) {
  const [isCustom, setIsCustom] = useState(false);
  const [dateParts, setDateParts] = useState<DateTimeParts>(
    getDateTimeParts(timeLimit.expiryDate)
  );
  
  const validateInput = (value: string, max: number, len: number = 2): string => {
    let processed = value.replace(/\D/g, '').slice(0, len);
    const num = parseInt(processed);
    if (!isNaN(num) && num > max) {
      processed = String(max).padStart(len, '0');
    }
    return processed;
  };

  const updateDatePart = (part: keyof DateTimeParts, value: string) => {
    const maxValues: Record<string, number> = {
      day: 31,
      month: 12,
      year: 9999,
      hours: 23,
      minutes: 59
    };
    
    const newValue = validateInput(value, maxValues[part], part === 'year' ? 4 : 2);
    
    setDateParts(prev => {
      const newParts = { ...prev, [part]: newValue };
      
      // Update the timeLimit when all parts are valid
      if (newParts.day && newParts.month && newParts.year && 
          newParts.hours && newParts.minutes) {
        const dateStr = `${newParts.year}-${newParts.month}-${newParts.day}T${newParts.hours}:${newParts.minutes}:00`;
        const newDate = new Date(dateStr);
        if (!isNaN(newDate.getTime())) {
          onChange({
            ...timeLimit,
            expiryDate: newDate.toISOString()
          });
        }
      }
      
      return newParts;
    });
  };

  const handlePresetSelect = (hours: number) => {
    const expiryDate = new Date();
    expiryDate.setHours(expiryDate.getHours() + hours);
    onChange({
      ...timeLimit,
      expiryDate: expiryDate.toISOString()
    });
    setDateParts(getDateTimeParts(expiryDate.toISOString()));
  };

  const getTimeRemaining = () => {
    const now = new Date();
    const expiry = new Date(timeLimit.expiryDate);
    const diff = expiry.getTime() - now.getTime();
    
    if (diff <= 0) return 'Expired';
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (days > 0) return `${days}d ${hours}h remaining`;
    if (hours > 0) return `${hours}h ${minutes}m remaining`;
    return `${minutes}m remaining`;
  };

  return (
    <div className="space-y-2 sm:space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs sm:text-sm">Expires:</span>
        <div className="flex gap-2">
          <button
            onClick={() => setIsCustom(false)}
            className={`px-3 py-1 rounded-md text-sm ${!isCustom 
              ? 'bg-emerald-500 text-white' 
              : 'bg-gray-600 hover:bg-gray-500'}`}
          >
            <Clock className="w-4 h-4 inline-block mr-1" />
            Preset
          </button>
          <button
            onClick={() => setIsCustom(true)}
            className={`px-3 py-1 rounded-md text-sm ${isCustom 
              ? 'bg-emerald-500 text-white' 
              : 'bg-gray-600 hover:bg-gray-500'}`}
          >
            <Calendar className="w-4 h-4 inline-block mr-1" />
            Custom
          </button>
        </div>
      </div>

      {!isCustom ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {[
            { label: '1 Hour', hours: 1 },
            { label: '6 Hours', hours: 6 },
            { label: '12 Hours', hours: 12 },
            { label: '1 Day', hours: 24 },
            { label: '3 Days', hours: 72 },
            { label: '1 Week', hours: 168 },
          ].map((duration) => (
            <button
              key={duration.hours}
              onClick={() => handlePresetSelect(duration.hours)}
              className="px-3 py-2 bg-gray-600 hover:bg-gray-500 rounded-md text-sm text-left"
            >
              {duration.label}
            </button>
          ))}
        </div>
      ) : (
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1">
            <input
              type="text"
              value={dateParts.day}
              onChange={(e) => updateDatePart('day', e.target.value)}
              className="w-10 bg-gray-600 border border-gray-500 rounded-md px-2 py-1 text-center"
              placeholder="DD"
            />
            <span>-</span>
            <input
              type="text"
              value={dateParts.month}
              onChange={(e) => updateDatePart('month', e.target.value)}
              className="w-10 bg-gray-600 border border-gray-500 rounded-md px-2 py-1 text-center"
              placeholder="MM"
            />
            <span>-</span>
            <input
              type="text"
              value={dateParts.year}
              onChange={(e) => updateDatePart('year', e.target.value)}
              className="w-16 bg-gray-600 border border-gray-500 rounded-md px-2 py-1 text-center"
              placeholder="YYYY"
            />
          </div>
          <div className="flex items-center gap-1">
            <input
              type="text"
              value={dateParts.hours}
              onChange={(e) => updateDatePart('hours', e.target.value)}
              className="w-10 bg-gray-600 border border-gray-500 rounded-md px-2 py-1 text-center"
              placeholder="HH"
            />
            <span>:</span>
            <input
              type="text"
              value={dateParts.minutes}
              onChange={(e) => updateDatePart('minutes', e.target.value)}
              className="w-10 bg-gray-600 border border-gray-500 rounded-md px-2 py-1 text-center"
              placeholder="MM"
            />
          </div>
        </div>
      )}

      <div className={`text-sm ${
        new Date(timeLimit.expiryDate) > new Date() 
          ? 'text-emerald-400' 
          : 'text-red-400'
      }`}>
        {getTimeRemaining()}
      </div>
    </div>
  );
}
