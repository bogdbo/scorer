import styled from 'styled-components';
import * as React from 'react';
import { Icon } from 'react-onsenui';

type MedalContainerProps = {
  type: number;
};

export const MedalContainer = styled.span`
  font-weight: bold;
  font-size: 0.8rem;
  color: ${(p: MedalContainerProps) =>
    p.type === 0 ? '#f6d600' : p.type === 1 ? '#cdcdcd' : '#cd611daa'};
  padding-left: 5px;
`;

interface MedalProps {
  count: number;
  type: number;
}

export const Medal: React.SFC<MedalProps> = (props: MedalProps) => {
  return (
    <MedalContainer type={props.type}>
      {props.count}
      <Icon icon="times" />
      <Icon icon="circle" />
    </MedalContainer>
  );
};
