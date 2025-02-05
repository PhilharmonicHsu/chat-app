export default function Button({children, color, onClick}) {
    let buttonColor = 'bg-white';

    if (color === 'blue') {
        buttonColor = 'bg-gradient-to-r from-[#6B93D6] to-[#375A96]'
    }

    if (color === 'brown') {
        buttonColor = 'bg-gradient-to-r from-[#9A7957] to-[#6C553B]'
    }

    return (
        <button 
            className={`${buttonColor} px-6 py-3 rounded-lg text-white text-lg font-semibold shadow-md hover:shadow-xl hover:scale-105 transform transition flex justify-center items-center gap-2`}
            onClick={onClick}
        >
            {children}
        </button>
    )
}