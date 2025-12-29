import { LoginButton } from 'features/auth';
import { PageLayout} from 'shared/ui';

export const HomePage = (() => {
  return (
    <PageLayout centerContent >
      {/*  text="React Spring Imperative Animations + FSD Architecture"*/}
      {/*  staggerDelay={7}*/}
      {/*  lightColors={[[0.45, 0.2, 145], [0.35, 0.25, 180]]}*/}
      {/*  darkColors={[[0.75, 0.25, 320], [0.65, 0.3, 280]]}*/}
      {/*  className="text-xs sm:text-sm md:text-base text-center mb-6"*/}
      {/*/>*/}
      <LoginButton />
    </PageLayout>
  );
});
