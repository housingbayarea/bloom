import { MigrationInterface, QueryRunner } from "typeorm"
import { Language } from "../shared/types/language-enum"

export class addAlaWhatToExpectTranslations1668473259849 implements MigrationInterface {
  name = "addAlaWhatToExpectTranslations1668473259849"

  public async up(queryRunner: QueryRunner): Promise<void> {
    const [{ id: alamedaJurisdiction }] = await queryRunner.query(
      `SELECT id FROM jurisdictions WHERE name = 'Alameda' LIMIT 1`
    )

    let alaSpanish = await queryRunner.query(
      `SELECT translations FROM translations WHERE jurisdiction_id = ($1) AND language = ($2)`,
      [alamedaJurisdiction, Language.es]
    )

    alaSpanish = alaSpanish["0"]["translations"]

    alaSpanish.confirmation = {
      ...alaSpanish.confirmation,
      eligible: {
        fcfs:
          "Se contactará a los solicitantes elegibles por orden hasta que se cubran las vacantes.",
        fcfsPreference:
          "Las preferencias para la vivienda, si corresponden, alterarán el orden de postulación.",
        lottery:
          "Una vez finalizado el período de solicitud, los solicitantes elegibles se ordenarán según el resultado de la lotería.",
        lotteryPreference:
          "Las preferencias para la vivienda, si corresponden, alterarán el orden resultante de la lotería.",
        waitlist:
          "Los solicitantes elegibles se colocarán en la lista de espera por orden de llegada hasta que se llenen los lugares de la lista de espera.",
        waitlistPreference:
          "Las preferencias para la vivienda, si corresponden, alterarán el orden en la lista de espera.",
        waitlistContact:
          "Es posible que se comuniquen con usted mientras esté en la lista de espera para confirmar que desea permanecer en ella.",
      },
      interview:
        "Si se comunican con usted para una entrevista, se le pedirá que complete una solicitud más detallada y que proporcione documentos de respaldo.",
    }

    await queryRunner.query(
      `UPDATE "translations" SET translations = ($1) where jurisdiction_id = ($2) and language = ($3)`,
      [alaSpanish, alamedaJurisdiction, Language.es]
    )

    let alaChinese = await queryRunner.query(
      `SELECT translations FROM translations WHERE jurisdiction_id = ($1) AND language = ($2)`,
      [alamedaJurisdiction, Language.zh]
    )

    alaChinese = alaChinese["0"]["translations"]

    alaChinese.confirmation = {
      ...alaChinese.confirmation,
      eligible: {
        fcfs: "我們將按照「先申請先入住」的原則聯絡合格的申請人，直至空置房被入住為止。",
        fcfsPreference: "住房優惠（如果適用）將影響「先申請先入住」順序。",
        lottery: "一旦申請期結束，合格的申請人將按抽籤名次進行排序。",
        lotteryPreference: "住房優惠（如果適用）將影響抽籤名次。",
        waitlist: "合格的申請人將按照「先申請先入住」的原則進入候補名單，直至候補名單額滿為止。",
        waitlistPreference: "住房優惠（如果適用）將影響候補名單的順序。",
        waitlistContact: "我們可能會在您進入候補名單時與您聯絡，確認您希望繼續留在候補名單上。",
      },
      interview: "如果我們聯絡您要求進行面談，您需要填寫更詳細的申請表並提供證明文件。",
    }

    await queryRunner.query(
      `UPDATE "translations" SET translations = ($1) where jurisdiction_id = ($2) and language = ($3)`,
      [alaChinese, alamedaJurisdiction, Language.zh]
    )

    let alaVietnamese = await queryRunner.query(
      `SELECT translations FROM translations WHERE jurisdiction_id = ($1) AND language = ($2)`,
      [alamedaJurisdiction, Language.vi]
    )

    alaVietnamese = alaVietnamese["0"]["translations"]

    alaVietnamese.confirmation = {
      ...alaVietnamese.confirmation,
      eligible: {
        fcfs:
          "Những người nộp đơn hội đủ điều kiện sẽ được liên lạc trên cơ sở ai đến trước được phục vụ trước cho đến khi hết căn hộ trống.",
        fcfsPreference:
          "Các ưu tiên về nhà ở, nếu có, sẽ làm thay đổi thứ tự ai đến trước được phục vụ trước.",
        lottery:
          "Sau khi thời gian nộp đơn kết thúc, những người nộp đơn hội đủ điều kiện sẽ được sắp xếp theo thứ tự dựa trên xếp hạng rút thăm.",
        lotteryPreference:
          "Các ưu tiên về nhà ở, nếu có, sẽ làm thay đổi thứ tự xếp hạng rút thăm.",
        waitlist:
          "Những người nộp đơn hội đủ điều kiện sẽ được ghi tên vào danh sách chờ trên cơ sở ai đến trước được phục vụ trước cho đến khi các vị trí trong danh sách chờ được lấp đầy.",
        waitlistPreference:
          "Các ưu tiên về nhà ở, nếu có, sẽ làm thay đổi thứ tự trong danh sách chờ.Housing preferences, if applicable, will affect waitlist order.",
        waitlistContact:
          "Chúng tôi có thể liên lạc với quý vị khi quý vị đang ở trong danh sách chờ để xác nhận rằng quý vị muốn tiếp tục ở lại trong danh sách chờ.",
      },
      interview:
        "Nếu quý vị được mời tham gia phỏng vấn, quý vị sẽ được yêu cầu điền một đơn đăng ký chi tiết hơn và cung cấp các giấy tờ hỗ trợ cần thiết.",
    }

    await queryRunner.query(
      `UPDATE "translations" SET translations = ($1) where jurisdiction_id = ($2) and language = ($3)`,
      [alaVietnamese, alamedaJurisdiction, Language.vi]
    )

    let alaFilipino = await queryRunner.query(
      `SELECT translations FROM translations WHERE jurisdiction_id = ($1) AND language = ($2)`,
      [alamedaJurisdiction, Language.tl]
    )

    alaFilipino = alaFilipino["0"]["translations"]

    alaFilipino.confirmation = {
      ...alaFilipino.confirmation,
      whatHappensNext: "What happens next?",
      eligible: {
        fcfs:
          "Ang mga kwalipikadong aplikante ay kokontakin sa batayang first come first serve hanggang sa mapuno ang bakante.",
        fcfsPreference:
          "Ang mga pagpipilian sa pabahay ay makakaapekto sa order ng waitlist, kung naaangkop.",
        lottery:
          "Kapag nagsara na ang oras ang aplikasyon, ang mga kwalipikadong aplikante ay ilalagay sa pila batay sa ranggo ng lottery.",
        lotteryPreference:
          "Ang mga pagpipilian sa pabahay ay makakaapekto sa order ng waitlist, kung naaangkop.",
        waitlist:
          "Ang mga kwalipikadong aplikante ay ilalagay sa waitlist sa batayang first come first serve hanggang sa mapuno ang mga puwesto ng waitlist.",
        waitlistPreference:
          "Ang mga pagpipilian sa pabahay ay makakaapekto sa order ng waitlist, kung naaangkop.",
        waitlistContact:
          "Maaari kang kontakin habang nasa waitlist para kumpirmahin na gusto mong manatiling nasa waitlist.",
      },
      interview:
        "Kapag tinawagan ka para sa isang interbyu, hihilingin sa inyo na sagutan nang mas detalyado ang aplikasyon at magbigay ng karagdagang mga dokumento.",
    }

    await queryRunner.query(
      `UPDATE "translations" SET translations = ($1) where jurisdiction_id = ($2) and language = ($3)`,
      [alaFilipino, alamedaJurisdiction, Language.tl]
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {}
}
