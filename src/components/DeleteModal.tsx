import { useNavigation } from "@react-navigation/native";
import { Modal, Pressable, StyleSheet, TouchableOpacity, View } from "react-native";
import { getDatabase } from "../database/database";
import { unpressDelete, useAppDispatch, useAppSelector } from "../store";
import { AppTheme } from "../styles/themes";
import { useAppTheme } from "./AppThemeProvider";
import SansSerifText from "./SansSerifText";

interface DeleteModalProps {
  reviewId: number;
}

export default function DeleteModal({reviewId}: DeleteModalProps) {
  const pressDelete = useAppSelector(state => state.button.pressDelete);

  const dispatch = useAppDispatch();
  const navigation = useNavigation();

  const theme = useAppTheme();
  const styles = createStyles(theme);

  const deleteReview = async () => {
    const db = await getDatabase();

    await db.runAsync(
      "DELETE FROM review WHERE id = ?;", 
      [reviewId]
    )
    .catch(err => console.error(err));

    dispatch(unpressDelete());
    navigation.reset({
      routes: [{name: "Tab"}]
    });
  }

  return (
    <Modal
      visible={pressDelete}
      transparent={true}
      onRequestClose={() => dispatch(unpressDelete())}
    >
      <Pressable 
        style={styles.background}
        onPress={() => dispatch(unpressDelete())}
      >
        <View style={styles.container}>
          <SansSerifText style={styles.notice}>
            현재 독서 기록을 삭제합니다. 해당 작업은 취소할 수 없습니다.
          </SansSerifText>

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.button}
              onPress={() => dispatch(unpressDelete())}
            >
              <SansSerifText>취소</SansSerifText>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.deleteButton]}
              onPress={deleteReview}
            >
              <SansSerifText>삭제</SansSerifText>
            </TouchableOpacity>
          </View>
        </View>
      </Pressable>
    </Modal>
  )
}

const createStyles = (theme: AppTheme) => StyleSheet.create({
  background: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#00000088"
  },
  container: {
    width: "75%",
    borderRadius: 8,
    padding: 20,
    backgroundColor: theme.background,
  },
  notice: {
    textAlign: "center",
    marginBottom: 20,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 20
  },
  button: {
    paddingHorizontal: 15,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: theme.secondaryContainer,
    borderRadius: 5,
  },
  deleteButton: {
    backgroundColor: theme.secondaryContainer
  }
});