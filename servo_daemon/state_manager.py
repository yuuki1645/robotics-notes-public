from __future__ import annotations
import json
from typing import Any, Dict, Optional

class StateManager:
    """状態管理クラス"""

    def __init__(self, state_path: str = "./state.json"):
        self.state_path = state_path
        self._state: Optional[Dict[str, Any]] = None

    def load(self) -> Dict[str, Any]:
        """状態を読み込む（キャッシュがあればそれを仕様）"""
        if self._state is None:
            try:
                with open(self.state_path, "r", encoding="utf-8") as f:
                    self._state = json.load(f)
            except FileNotFoundError:
                self._state = {}
            except json.JSONDecodeError:
                # ファイルが破損していた場合は空の辞書を使用
                self._state = {}
        return self._state

    def save(self) -> None:
        """状態を保存する"""
        if self._state is not None:
            try:
                with open(self.state_path, "w", encoding="utf-8") as f:
                    json.dump(self._state, f, ensure_ascii=False, indent=4)
            except Exception as e:
                print(f"[WARN] failed to save state: {e}")

    def get(self, key: str, default: Any = None) -> Any:
        """状態を取得する"""
        state = self.load()
        return state.get(key, default)

    def set(self, key: str, value: Any) -> None:
        """状態を設定する"""
        state = self.load()
        state[key] = value
        self.save()

    def update(self, updates: Dict[str, Any]) -> None:
        """複数の値を一度に更新"""
        state = self.load()
        state.update(updates)
        self.save()

    def clear_cache(self) -> None:
        """キャッシュをクリアする"""
        self._state = None

    def get_all(self) -> Dict[str, Any]:
        """全ての状態を取得する"""
        return self.load().copy()