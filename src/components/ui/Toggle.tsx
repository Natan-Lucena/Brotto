import { Switch, SwitchProps } from 'react-native';
export function Toggle(props: SwitchProps) {
  return <Switch trackColor={{ true: '#2F6B4F' }} {...props} />;
}
