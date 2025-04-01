// components/VirtualizedScrollView.tsx
import React from "react";
import { FlatList } from "react-native";

const VirtualizedScrollView = (props: any) => {
  return (
    <FlatList
      {...props}
      data={[]}
      keyExtractor={(_, index) => "key-" + index}
      renderItem={null}
      ListEmptyComponent={null}
      ListHeaderComponent={<>{props.children}</>}
    />
  );
};

export default VirtualizedScrollView;
