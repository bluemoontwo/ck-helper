import fs from "fs";

/**
 * JSON 파일을 사용하여 데이터를 저장하고 관리하는 클래스
 */
export default class StoreManager {
  /** 저장소 이름 */
  private storeName: string;
  /** 저장 파일 경로 */
  private filePath: string;

  /**
   * StoreManager 클래스의 생성자
   * @param storeName 저장소 이름
   */
  constructor(storeName: string) {
    this.storeName = storeName;
    this.filePath = `.store/${this.storeName}.json`;

    // .store 디렉토리가 없으면 생성
    if (!fs.existsSync(".store")) {
      fs.mkdirSync(".store", { recursive: true });
    }

    // 파일이 없으면 빈 객체로 초기화
    if (!fs.existsSync(this.filePath)) {
      fs.writeFileSync(this.filePath, "{}", "utf8");
    }
  }

  /**
   * 저장소에서 값을 가져오는 메서드
   * @param key 점(.)으로 구분된 키 경로
   * @returns 저장된 값 또는 undefined
   */
  public get<T>(key: string): T | undefined {
    try {
      const data = fs.readFileSync(this.filePath, "utf8");
      const parsedData = JSON.parse(data);

      // 점으로 구분된 경로를 따라 값을 찾음
      return key.split(".").reduce((obj: any, path) => {
        return obj?.[path];
      }, parsedData);
    } catch (error) {
      console.error(`Error reading from store: ${error}`);
      return undefined;
    }
  }

  /**
   * 저장소에 값을 저장하는 메서드
   * @param key 점(.)으로 구분된 키 경로
   * @param value 저장할 값
   */
  public set(key: string, value: unknown): void {
    try {
      const data = fs.readFileSync(this.filePath, "utf8");
      const parsedData = JSON.parse(data);

      const paths = key.split(".");
      let current = parsedData;

      // 중첩된 객체 구조 생성
      for (let i = 0; i < paths.length - 1; i++) {
        if (!(paths[i] in current)) {
          current[paths[i]] = {};
        }
        current = current[paths[i]];
      }

      // 최종 값 설정
      current[paths[paths.length - 1]] = value;

      // 파일에 저장
      fs.writeFileSync(
        this.filePath,
        JSON.stringify(parsedData, null, 2),
        "utf8"
      );
    } catch (error) {
      console.error(`Error writing to store: ${error}`);
    }
  }

  /**
   * 저장소에서 값을 삭제하는 메서드
   * @param key 점(.)으로 구분된 키 경로
   */
  public delete(key: string): void {
    const store = new StoreManager(this.storeName);
    store.set(key, undefined);
  }
}
