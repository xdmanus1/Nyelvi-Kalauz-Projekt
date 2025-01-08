# Nyelvi Kalauz - Japán alapszavak és mondatok turistáknak

## Projekt Terv
Ez a projekt egy nyelvi segédalkalmazás fejlesztését célozza, amely japán alapszavakat és kifejezéseket tanít turistáknak és hobby tanulóknak. Az alkalmazás interaktív kártyák, quiz-ek, és vizuális elemek segítségével segíti a tanulást.

---

## Időtartam
**5 hónap**

---

## Fejlesztési Fázisok

### 1. Hónap: Ötlet specifikáció és alapok kialakítása
**Célkitűzések**:
- Az alkalmazás alapvető funkcióinak definiálása.
- Interaktív kártyák tervezése:
  - **Japán írás**: Hiragana, Katakana, Kanji.
  - **Fonetikus leírás**: Latin betűs romaji.
  - **Angol fordítás**.
  - **Hang és kiejtés**: Felolvasás.
  - **Ikonok**: Tárgyakhoz kapcsolódó vizuális elemek.

- **Quiz rendszer**:
  - Kártya-forgatós stílus.
  - Illusztrációk a felhasználók segítésére.

**Célközönség**:
- Turisták.
- Hobby tanulók.

---

## Tervezett Technológiák

### Frontend:
- React vagy Svelte
- CSS
- JavaScript / TypeScript

### Backend:
- Firebase (ajánlott, gyors fejlesztéshez).

### Adatbázis:
- Firebase vagy MongoDB

---

## Adatbázis Struktúra

| Oszlop neve  | Típus      | Leírás                                                      |
|--------------|------------|------------------------------------------------------------|
| id           | Egész szám | Egyedi azonosító minden rekordhoz. (Primary key)           |
| icon         | Ikon       | Kép / ikon, ami tárgyakat jelöl.                          |
| japanese     | Szöveg     | Japán kifejezés vagy mondat. (Hiragana / Katakana / Kanji) |
| phonetic     | Szöveg     | Fonetikus átírás latin betűkkel. (Romaji)                  |
| english      | Szöveg     | Angol fordítás.                                            |
| audioUrl     | Szöveg (URL)| A kiejtést tartalmazó hangfájl elérhetősége.              |

---

## Fejlesztési Folyamat

1. **Felhasználói folyamatok tervezése**:
   - Tanulási lépések meghatározása.
   - Quiz funkciók kialakítása.

2. **UI Tervezés**:
   - Kártyák megjelenítése (ikonok, szövegek, illusztrációk).

3. **Backend Fejlesztés**:
   - Firebase integráció (adatbázis, felhasználói hitelesítés).

4. **Tesztelés**:
   - Funkciók tesztelése (interaktivitás, adatkezelés).

---

## Hozzájárulás

Szeretettel várjuk ötleteidet és visszajelzésedet! Hozzájárulási irányelveinket a [CONTRIBUTING.md](CONTRIBUTING.md) fájl tartalmazza.

---

## Licensz
MIT Licensz – lásd a [LICENSE](LICENSE) fájlt.
