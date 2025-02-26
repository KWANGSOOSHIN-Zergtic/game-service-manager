import React from 'react';
import { Toggle } from '@/components/ui/toggle';
import { useDebugContext } from './DebugContext';
import { Bug } from 'lucide-react';

interface DebugToggleButtonProps {
  className?: string;
}

/**
 * 디버그 정보 표시를 토글하는 버튼 컴포넌트
 */
export const DebugToggleButton: React.FC<DebugToggleButtonProps> = ({ 
  className = '' 
}) => {
  const { isDebugMode, toggleDebugMode } = useDebugContext();

  return (
    <Toggle
      aria-label="디버그 정보 토글"
      className={`p-2 h-auto ${className}`}
      pressed={isDebugMode}
      onPressedChange={toggleDebugMode}
      title="디버그 정보 표시"
    >
      <Bug className={`h-4 w-4 ${isDebugMode ? 'text-green-600' : 'text-gray-500'}`} />
    </Toggle>
  );
}; 