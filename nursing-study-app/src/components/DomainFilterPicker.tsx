import React, { useEffect, useState } from 'react';
import { View } from 'react-native';
import { AppText } from './AppText';
import { Chip } from './UI';
import { getDomains } from '../db/queries';
import { Domain } from '../types';
import { spacing } from '../theme/theme';

interface Props {
  value: 'all' | number[];
  onChange: (value: 'all' | number[]) => void;
  label?: string;
}

export function DomainFilterPicker({ value, onChange, label }: Props) {
  const [domains, setDomains] = useState<Domain[]>([]);

  useEffect(() => {
    getDomains().then(setDomains);
  }, []);

  const isAll = value === 'all';
  const selectedIds = isAll ? [] : value;

  const toggleDomain = (id: number) => {
    if (isAll) {
      onChange([id]);
      return;
    }
    if (selectedIds.includes(id)) {
      const next = selectedIds.filter((x) => x !== id);
      onChange(next.length === 0 ? 'all' : next);
    } else {
      onChange([...selectedIds, id]);
    }
  };

  return (
    <View>
      {label ? (
        <AppText weight="medium" size={13.5} color="#00000099" style={{ marginBottom: spacing.sm }}>
          {label}
        </AppText>
      ) : null}
      <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
        <Chip label="همه حوزه‌ها" selected={isAll} onPress={() => onChange('all')} />
        {domains.map((d) => (
          <Chip
            key={d.id}
            label={d.name}
            selected={!isAll && selectedIds.includes(d.id)}
            onPress={() => toggleDomain(d.id)}
            color={d.color}
          />
        ))}
      </View>
    </View>
  );
}
