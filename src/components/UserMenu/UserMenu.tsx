import React, { useEffect, useState } from 'react';
import { Flex, FlexItem } from '@patternfly/react-core/dist/esm/layouts/Flex';
import { Avatar } from '@patternfly/react-core/dist/dynamic/components/Avatar';
import { Dropdown, DropdownItem, DropdownList } from '@patternfly/react-core/dist/esm/components/Dropdown';
import { Divider } from '@patternfly/react-core/dist/esm/components/Divider';
import { MenuToggle, MenuToggleElement } from '@patternfly/react-core/dist/esm/components/MenuToggle';
import { CaretDownIcon } from '@patternfly/react-icons/dist/dynamic/icons/caret-down-icon';
import ThemePreference from './ThemePreference';
import { signOut, useSession } from 'next-auth/react';

const UserMenu: React.FC = () => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const { data: session } = useSession();
  const [userName, setUserName] = useState<string>('');
  const [userImage, setUserImage] = useState<string>('');

  useEffect(() => {
    if (session?.user?.name === 'Admin') {
      setUserName(session?.user?.name);
      setUserImage('https://www.patternfly.org/images/668560cd.svg');
    } else {
      setUserName(session?.user?.name ?? '');
      setUserImage(session?.user?.image ?? '');
    }
  }, [session?.user?.name, session?.user?.image]);

  const onToggleClick = () => {
    setIsOpen(!isOpen);
  };

  const onSelect = () => {
    setIsOpen(false);
  };

  return (
    <Dropdown
      isOpen={isOpen}
      onSelect={onSelect}
      onOpenChange={(isOpen: boolean) => setIsOpen(isOpen)}
      toggle={(toggleRef: React.Ref<MenuToggleElement>) => (
        <MenuToggle ref={toggleRef} aria-label="user menu dropdown" variant="plain" onClick={onToggleClick} isExpanded={isOpen}>
          <Flex spaceItems={{ default: 'spaceItemsSm' }} style={{ display: 'flex', alignItems: 'center' }}>
            <FlexItem>
              <Avatar src={userImage} alt={userName} />
            </FlexItem>
            <FlexItem> {userName}</FlexItem>
            <FlexItem>
              <CaretDownIcon />
            </FlexItem>
          </Flex>
        </MenuToggle>
      )}
      shouldFocusToggleOnSelect
      style={{ position: 'relative' }}
    >
      <DropdownList>
        <ThemePreference />
        <Divider component="li" key="separator" />

        <DropdownItem value={2} key="Log out" onClick={() => signOut()}>
          Log out
        </DropdownItem>
      </DropdownList>
    </Dropdown>
  );
};

export default UserMenu;
