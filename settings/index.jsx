function mySettings(props) {
  return (
    <Page>
      <Section
        title={<Text bold align="center">Demo Settings</Text>}>
        <Toggle
          settingsKey="toggle"
          label="Toggle Switch"
        />
        <ColorSelect
          settingsKey="color"
          colors={[
            {color: "tomato"},
            {color: "sandybrown"},
            {color: "#FFD700"},
            {color: "#ADFF2F"},
            {color: "deepskyblue"},
            {color: "plum"},
            {color: "#000000"},
            {color: "#f01a1a"}
          ]}
        />
      </Section>
      <Section
        title={<Text bold align="center">The Silph Road Settings</Text>}>
        <Button
          label="Retrieve Current Tasks"
          onClick={() => {
            props.settingsStorage.setItem("TSRRequestTasks", "true");
          }}>
        </Button>
        <Button
          label="Test File Transfer"
          onClick={() => {
            props.settingsStorage.setItem("TestFileTransfer", "true");
          }}>
        </Button>
      </Section>
    </Page>
  );
}

registerSettingsPage(mySettings);
