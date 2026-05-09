# Mobile App Integration Guide

## 📱 Price List & Product Catalog Data Structure

Both **Price List** and **Product Catalog** are stored in Firestore with both **image** and **PDF** files linked together. The mobile app can fetch these documents and display them together.

## 🔥 Firestore Structure

### Price List
- **Path**: `settings/documents/pricelist/latest`
- **Document Fields**:
  ```typescript
  {
    title: string;           // PDF file name
    url: string;             // PDF download URL (Storage URL)
    imageUrl?: string;       // Image preview URL (Storage URL)
    updatedAt: Timestamp;    // Last update timestamp
  }
  ```

### Product Catalog
- **Path**: `settings/documents/products/latest`
- **Document Fields**:
  ```typescript
  {
    title: string;           // PDF file name
    url: string;             // PDF download URL (Storage URL)
    imageUrl?: string;       // Image preview URL (Storage URL)
    updatedAt: Timestamp;    // Last update timestamp
  }
  ```

## 📖 How to Fetch in Mobile App

### Firebase Firestore Query Examples

#### JavaScript/TypeScript (React Native / Expo)
```typescript
import { doc, getDoc } from 'firebase/firestore';
import { db } from './config/firebase';

// Fetch Price List
async function getPriceList() {
  const docRef = doc(db, 'settings', 'documents', 'pricelist', 'latest');
  const docSnap = await getDoc(docRef);
  
  if (docSnap.exists()) {
    const data = docSnap.data();
    return {
      title: data.title,
      pdfUrl: data.url,
      imageUrl: data.imageUrl,
      updatedAt: data.updatedAt
    };
  }
  return null;
}

// Fetch Product Catalog
async function getProductCatalog() {
  const docRef = doc(db, 'settings', 'documents', 'products', 'latest');
  const docSnap = await getDoc(docRef);
  
  if (docSnap.exists()) {
    const data = docSnap.data();
    return {
      title: data.title,
      pdfUrl: data.url,
      imageUrl: data.imageUrl,
      updatedAt: data.updatedAt
    };
  }
  return null;
}
```

#### Swift (iOS)
```swift
import FirebaseFirestore

func getPriceList(completion: @escaping (PriceListData?) -> Void) {
    let docRef = Firestore.firestore()
        .collection("settings")
        .document("documents")
        .collection("pricelist")
        .document("latest")
    
    docRef.getDocument { document, error in
        guard let document = document, document.exists,
              let data = document.data() else {
            completion(nil)
            return
        }
        
        let priceList = PriceListData(
            title: data["title"] as? String ?? "",
            pdfUrl: data["url"] as? String ?? "",
            imageUrl: data["imageUrl"] as? String,
            updatedAt: data["updatedAt"] as? Timestamp
        )
        completion(priceList)
    }
}
```

#### Kotlin (Android)
```kotlin
import com.google.firebase.firestore.FirebaseFirestore

fun getPriceList(callback: (PriceListData?) -> Unit) {
    FirebaseFirestore.getInstance()
        .collection("settings")
        .document("documents")
        .collection("pricelist")
        .document("latest")
        .get()
        .addOnSuccessListener { document ->
            if (document.exists()) {
                val data = document.data
                val priceList = PriceListData(
                    title = data["title"] as? String ?: "",
                    pdfUrl = data["url"] as? String ?: "",
                    imageUrl = data["imageUrl"] as? String,
                    updatedAt = data["updatedAt"] as? Timestamp
                )
                callback(priceList)
            } else {
                callback(null)
            }
        }
        .addOnFailureListener {
            callback(null)
        }
}
```

## 🎨 Display Recommendations

### UI Flow:
1. **Show Image** (if available) - Display the preview image
2. **Show PDF Button** - Allow user to download/view the PDF
3. **Show Both Together** - Display image above, PDF link below

### Example React Native Component:
```typescript
import { Image, View, TouchableOpacity, Text } from 'react-native';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';

function PriceListItem({ priceList }) {
  return (
    <View>
      {/* Image Preview */}
      {priceList.imageUrl && (
        <Image 
          source={{ uri: priceList.imageUrl }} 
          style={{ width: '100%', height: 200 }}
        />
      )}
      
      {/* PDF Download Button */}
      {priceList.pdfUrl && (
        <TouchableOpacity onPress={() => downloadPDF(priceList.pdfUrl)}>
          <Text>📄 Download {priceList.title}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

async function downloadPDF(url: string) {
  // Download and open PDF
  const fileUri = FileSystem.documentDirectory + 'pricelist.pdf';
  await FileSystem.downloadAsync(url, fileUri);
  await Sharing.shareAsync(fileUri);
}
```

## 🔐 Security Rules

The Firestore security rules allow:
- **Read**: Any authenticated user
- **Write**: Only admins (checked via `isAdmin()` function)

Make sure your mobile app:
1. Authenticates users before fetching
2. Handles cases where `imageUrl` might be `null` (optional field)
3. Handles cases where document doesn't exist yet

## 📍 Storage URLs

Both `imageUrl` and `url` (PDF) are Firebase Storage download URLs. They are:
- Publicly accessible (if Storage rules allow)
- Signed URLs that expire after a certain time
- Can be used directly in `<Image>` or `<img>` tags

## ✅ Status Check

The admin panel shows:
- ✅ **Ready**: Both image and PDF uploaded
- ⚠️ **Partial**: Only one file uploaded
- ❌ **Not ready**: No files uploaded

The mobile app should handle all three states gracefully.

## 🔄 Real-time Updates (Optional)

If you want real-time updates when admin changes the files:

```typescript
import { doc, onSnapshot } from 'firebase/firestore';

// Listen for changes
const unsubscribe = onSnapshot(
  doc(db, 'settings', 'documents', 'pricelist', 'latest'),
  (docSnap) => {
    if (docSnap.exists()) {
      const data = docSnap.data();
      // Update UI with new data
      updatePriceList(data);
    }
  }
);

// Don't forget to unsubscribe
// unsubscribe();
```

## 📝 TypeScript Types

```typescript
interface PriceListData {
  title: string;
  url: string;              // PDF URL
  imageUrl?: string;        // Image URL (optional)
  updatedAt: Timestamp;
}

interface ProductCatalogData {
  title: string;
  url: string;              // PDF URL
  imageUrl?: string;        // Image URL (optional)
  updatedAt: Timestamp;
}
```

## 🚀 Quick Start

1. **Authenticate user** in mobile app
2. **Fetch document** from Firestore path
3. **Check if both URLs exist**
4. **Display image** (if available)
5. **Show PDF download button** (if available)
6. **Handle errors** gracefully (no document, no URLs, etc.)

---

**Last Updated**: When admin uploads both image and PDF, they are linked together in the same Firestore document and will be displayed together in the mobile app.

