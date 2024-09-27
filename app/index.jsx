import { StatusBar } from "expo-status-bar";
import { View, Text, Image, ScrollView } from "react-native";

export default function App(){
    return (
        <View style={StyleSheet.container}>
            <Text>Kade</Text>
            <StatusBar style="auto"/>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
    },
});
