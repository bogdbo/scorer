import * as React from 'react';
import { Page, List, ListItem, Switch, ListHeader } from 'react-onsenui';
import { X01GameSettings, DartsLeg } from './../models';
import styled from 'styled-components';

const StartingScoreContainer = styled.div`
  display: flex;
  flex: 1;
  align-content: center;
  justify-content: center;
  padding-right: 10px;
  > select {
    height: 30px;
    display: flex;
    flex: 1;
  }
`;

interface Props {
  settings: X01GameSettings;
  onSettingsChanged(gameSettings: X01GameSettings): void;
}

export const X01Settings: React.SFC<Props> = (props: Props) => {
  const getHandleSwitchHandler = (type: 'Start' | 'End', key: DartsLeg) => {
    return (e: any) => {
      if (type === 'Start') {
        if (e.target.checked) {
          props.settings.startingLeg |= key;
        } else {
          props.settings.startingLeg &= ~key;
          if (props.settings.startingLeg === 0) {
            props.settings.startingLeg = DartsLeg.Single;
          }
        }
      } else {
        if (e.target.checked) {
          props.settings.endingLeg |= key;
        } else {
          props.settings.endingLeg &= ~key;
          if (props.settings.endingLeg === 0) {
            props.settings.endingLeg = DartsLeg.Double;
          }
        }
      }

      props.onSettingsChanged(props.settings);
    };
  };

  const renderLegSettings = (label: 'Start' | 'End', subtitle: string) => {
    return Object.keys(DartsLeg)
      .filter((key: any) => isNaN(key))
      .map(key => {
        return (
          <ListItem key={key + label} tappable={true}>
            <label className="center" htmlFor={key + label}>
              <span className="list-item__title">{`${key} ${label}`}</span>
              <span className="list-item__subtitle">{`${subtitle} ${key}`}</span>
            </label>
            <div className="right">
              <Switch
                checked={
                  label === 'Start'
                    ? (props.settings.startingLeg & DartsLeg[key]) ===
                      DartsLeg[key]
                    : (props.settings.endingLeg & DartsLeg[key]) ===
                      DartsLeg[key]
                }
                inputId={key + label}
                onChange={getHandleSwitchHandler(label, DartsLeg[key])}
              />
            </div>
          </ListItem>
        );
      });
  };

  const renderStartingLegSettings = () => {
    return renderLegSettings('Start', 'Allow first dart to be a');
  };

  const renderEndingLegSettings = () => {
    return renderLegSettings('End', 'Allow last dart to be a');
  };

  const handleStartingScoreChange = (e: any) => {
    props.settings.startScore = parseInt(e.target.value, 0);
    props.onSettingsChanged(props.settings);
  };

  return (
    <Page>
      <List>
        <ListHeader>
          <b>Starting score</b>
        </ListHeader>
        <ListItem>
          <StartingScoreContainer>
            <select
              defaultValue={props.settings.startScore.toString()}
              className="select-input"
              onChange={handleStartingScoreChange}
            >
              <option value={301}>301 points</option>
              <option value={501}>501 points</option>
              <option value={1001}>1001 points</option>
            </select>
          </StartingScoreContainer>
        </ListItem>
        <ListHeader>
          <b>Starting a game</b>
        </ListHeader>
        {renderStartingLegSettings()}
        <ListHeader>
          <b>Ending a game</b>
        </ListHeader>
        {renderEndingLegSettings()}
      </List>
    </Page>
  );
};
