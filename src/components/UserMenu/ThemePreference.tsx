import React from 'react';
import { Text, TextVariants } from '@patternfly/react-core/dist/dynamic/components/Text';
import { Flex, FlexItem } from '@patternfly/react-core/dist/esm/layouts/Flex';
import { DropdownItem } from '@patternfly/react-core/dist/esm/components/Dropdown';
import { Theme, useTheme } from '../../context/ThemeContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSun, faMoon, faCheck } from '@fortawesome/free-solid-svg-icons';

const ThemePreference: React.FC = () => {
  const { theme, setTheme } = useTheme();

  const handleThemeSwitch = (theme: Theme) => {
    setTheme(theme);
  };

  return (
    <>
      <DropdownItem isDisabled key="Theme">
        <Text component={TextVariants.small}>Theme preference</Text>
      </DropdownItem>

      <DropdownItem value={0} key="Light" onClick={() => handleThemeSwitch('light')}>
        <Flex spaceItems={{ default: 'spaceItemsSm' }}>
          <FlexItem>
            <FontAwesomeIcon icon={faSun} />{' '}
          </FlexItem>

          <FlexItem spacer={{ default: 'spacer2xl' }}>Light theme </FlexItem>
          {theme === 'light' && (
            <FlexItem>
              <FontAwesomeIcon icon={faCheck} style={{ color: '#0066CC' }} />{' '}
            </FlexItem>
          )}
        </Flex>
      </DropdownItem>

      <DropdownItem value={1} key="Dark" onClick={() => handleThemeSwitch('dark')}>
        <Flex spaceItems={{ default: 'spaceItemsSm' }}>
          <FlexItem>
            <FontAwesomeIcon icon={faMoon} />{' '}
          </FlexItem>

          <FlexItem spacer={{ default: 'spacer2xl' }}>Dark theme </FlexItem>
          {theme === 'dark' && (
            <FlexItem>
              <FontAwesomeIcon icon={faCheck} style={{ color: '#0066CC' }} />{' '}
            </FlexItem>
          )}
        </Flex>
      </DropdownItem>
    </>
  );
};

export default ThemePreference;
