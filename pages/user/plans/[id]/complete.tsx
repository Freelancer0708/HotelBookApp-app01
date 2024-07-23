import withAuthUser from "../../../../hoc/withAuthUser";

const ReservationComplete = () => {
    return (
        <div>
            <h1>予約登録完了</h1>
            <p>予約が完了しました。ありがとうございました。</p>
        </div>
    );
};

export default withAuthUser(ReservationComplete);
