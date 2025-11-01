import React from 'react';
import { View, Text, TextInput, StyleSheet, Image, TouchableOpacity } from 'react-native';


export default function Header({ title = 'Good Morning, User' }) {
return (
<View style={styles.header}>
<View style={styles.leftRow}>
<Image source={{ uri: 'https://i.pravatar.cc/100' }} style={styles.avatar} />
<View>
<Text style={styles.greeting}>{title}</Text>
<Text style={styles.date}>Tuesday, March 18, 2025</Text>
</View>
</View>


<TouchableOpacity style={styles.iconCircle}>
<Text style={{ fontSize: 18 }}>⚙️</Text>
</TouchableOpacity>


<View style={styles.searchWrap}>
<TextInput placeholder="Search Salon, Specialist" placeholderTextColor="#777" style={styles.searchInput} />
</View>
</View>
);
}


const styles = StyleSheet.create({
header: {
paddingTop: 36,
paddingHorizontal: 18,
paddingBottom: 8,
backgroundColor: '#6C2BD9',
},
leftRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
avatar: { width: 44, height: 44, borderRadius: 22, marginRight: 10 },
greeting: { color: '#fff', fontWeight: '700' },
date: { color: '#EADCFF', fontSize: 12 },
iconCircle: { position: 'absolute', right: 18, top: 42, width: 40, height: 40, borderRadius: 20, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center' },
searchWrap: { marginTop: 12, backgroundColor: '#fff', padding: 10, borderRadius: 14 },
searchInput: { height: 38 },
});