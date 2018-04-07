import styled from 'styled-components';
import * as React from 'react';
import { ProgressCircular } from 'react-onsenui';

const ProgressContainer = styled.div`
  display: flex;
  width: 100%;
  height: 100%;
  align-items: center;
  justify-content: center;
`;

export const Progress: React.StatelessComponent = () => {
  return (
    <ProgressContainer>
      <ProgressCircular indeterminate={true} />
    </ProgressContainer>
  );
};
