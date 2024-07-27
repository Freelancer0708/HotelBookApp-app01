import withAuthUser from "../../../../hoc/withAuthUser";

const ReservationComplete = () => {
    return (
        <div className="user-complete">
            <h2>予約登録完了</h2>
            <p>
                予約が完了いたしました。<br />
                10分以内に登録したメールアドレスに<br/>
                予約完了メールをが届きますので、<br/>
                ご確認いただけますと幸いです。
            </p>
        </div>
    );
};

export default withAuthUser(ReservationComplete);
