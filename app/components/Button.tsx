export default function Button({children, color, onClick, disabled = false}) {
    let buttonColor = 'bg-white';
    let hover = "hover:shadow-xl hover:scale-105"

    if (color === 'blue') {
        buttonColor = 'bg-gradient-to-r from-[#6B93D6] to-[#375A96]'
    }

    if (color === 'brown') {
        buttonColor = 'bg-gradient-to-r from-[#9A7957] to-[#6C553B]'
    }

    if (color === 'red') {
        buttonColor = 'bg-gradient-to-r from-[#D9534F] to-[#C9302C]'
    }

    if (color === 'green') {
        buttonColor = 'bg-gradient-to-r from-[#67C867] to-[#2E8B57]'
    }

    if (disabled) {
        hover = 'cursor-not-allowed';
    }


    return (
        <button 
            className={`${buttonColor} min-w-[170px] min-h-[55px] px-6 py-3 rounded-lg text-white text-lg font-semibold shadow-md ${hover} transform transition flex justify-center items-center gap-2`}
            onClick={onClick}
            disabled={disabled}
        >
            {children}
        </button>
    )
}