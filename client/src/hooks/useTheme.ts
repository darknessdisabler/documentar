import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Theme, UserSettings } from '@/lib/types';

export function useTheme() {
  const queryClient = useQueryClient();
  
  const { data: settings, isLoading } = useQuery<UserSettings>({
    queryKey: ['/api/settings'],
  });

  const updateSettingsMutation = useMutation({
    mutationFn: async (updates: Partial<UserSettings>) => {
      const response = await apiRequest('PUT', '/api/settings', updates);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/settings'] });
    },
  });

  const updateTheme = (theme: Partial<Theme>) => {
    if (!settings) return;
    
    const updatedTheme = { ...settings.theme, ...theme };
    updateSettingsMutation.mutate({ theme: updatedTheme });
    
    // Apply theme to CSS variables immediately
    applyThemeToDOM(updatedTheme);
  };

  const updateLanguage = (language: 'uk' | 'en') => {
    updateSettingsMutation.mutate({ language });
  };

  // Apply theme to DOM
  const applyThemeToDOM = (theme: Theme) => {
    const root = document.documentElement;
    root.style.setProperty('--theme-primary', theme.primaryColor);
    root.style.setProperty('--theme-secondary', theme.secondaryColor);
    root.style.setProperty('--theme-accent', theme.accentColor);
    root.style.setProperty('--theme-font', theme.fontFamily);
  };

  // Apply theme on load
  useEffect(() => {
    if (settings?.theme) {
      applyThemeToDOM(settings.theme);
    }
  }, [settings?.theme]);

  return {
    theme: settings?.theme,
    language: settings?.language || 'uk',
    isLoading,
    updateTheme,
    updateLanguage,
    isUpdating: updateSettingsMutation.isPending,
  };
}
