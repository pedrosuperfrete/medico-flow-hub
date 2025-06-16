
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface AvailabilityStepProps {
  onNext: (data: any) => void;
  onBack: () => void;
  initialData: any;
}

const AvailabilityStep: React.FC<AvailabilityStepProps> = ({ onNext, onBack, initialData }) => {
  const [availability, setAvailability] = useState({
    monday: { enabled: true, start: '08:00', end: '17:00' },
    tuesday: { enabled: true, start: '08:00', end: '17:00' },
    wednesday: { enabled: true, start: '08:00', end: '17:00' },
    thursday: { enabled: true, start: '08:00', end: '17:00' },
    friday: { enabled: true, start: '08:00', end: '17:00' },
    saturday: { enabled: false, start: '08:00', end: '12:00' },
    sunday: { enabled: false, start: '08:00', end: '12:00' },
    ...initialData
  });

  const days = [
    { key: 'monday', label: 'Segunda-feira' },
    { key: 'tuesday', label: 'Terça-feira' },
    { key: 'wednesday', label: 'Quarta-feira' },
    { key: 'thursday', label: 'Quinta-feira' },
    { key: 'friday', label: 'Sexta-feira' },
    { key: 'saturday', label: 'Sábado' },
    { key: 'sunday', label: 'Domingo' },
  ];

  const updateAvailability = (day: string, field: string, value: boolean | string) => {
    setAvailability(prev => ({
      ...prev,
      [day]: {
        ...prev[day as keyof typeof prev],
        [field]: value
      }
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onNext(availability);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Horários de Funcionamento</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {days.map((day) => (
            <div key={day.key} className="flex items-center space-x-4 p-3 border rounded-lg">
              <div className="flex items-center space-x-2 min-w-[180px]">
                <Checkbox
                  id={day.key}
                  checked={availability[day.key as keyof typeof availability].enabled}
                  onCheckedChange={(checked) => 
                    updateAvailability(day.key, 'enabled', checked as boolean)
                  }
                />
                <Label htmlFor={day.key} className="font-medium">
                  {day.label}
                </Label>
              </div>
              
              {availability[day.key as keyof typeof availability].enabled && (
                <div className="flex items-center space-x-2">
                  <Label className="text-sm">De:</Label>
                  <Input
                    type="time"
                    value={availability[day.key as keyof typeof availability].start}
                    onChange={(e) => updateAvailability(day.key, 'start', e.target.value)}
                    className="w-24"
                  />
                  <Label className="text-sm">Até:</Label>
                  <Input
                    type="time"
                    value={availability[day.key as keyof typeof availability].end}
                    onChange={(e) => updateAvailability(day.key, 'end', e.target.value)}
                    className="w-24"
                  />
                </div>
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="flex justify-between pt-4">
        <Button type="button" variant="outline" onClick={onBack}>
          Voltar
        </Button>
        <Button type="submit" className="px-8">
          Continuar
        </Button>
      </div>
    </form>
  );
};

export default AvailabilityStep;
