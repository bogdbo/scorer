import styled from 'styled-components';

export const Button = styled.div`
  cursor: pointer;
  font-size: 1.2rem;
  display: flex;
  flex: 1 1 auto;
  vertical-align: middle;
  align-self: center;
  height: 100%;
  width: 100%;
  align-items: center;
  justify-content: center;
  color: #5c5e5f;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.12);
  background-color: ${(props: { odd?: boolean }) =>
    props.odd ? '#B9C6C9' : '#C6D2D4'};

  :active {
    background-color: #e97f02;
  }
`;
