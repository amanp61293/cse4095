interface AppTitleProps {
  title?: string;
}

export function AppTitle({ title = 'Math Practice' }: AppTitleProps) {
  return <h1 id="app-title">{title}</h1>;
}
