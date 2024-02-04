import react from "react";

function SendPanel() {
  return (
    <div className="join w-full p-2">
      <input
        type="text"
        placeholder="Type here"
        className="input input-bordered w-full mr-2 px-2"
      />
      <button className="btn btn-square">
        <svg
          transform="rotate(90)"
          class="w-6 h-6 text-gray-800 dark:text-white"
          aria-hidden="true"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <path
            stroke="currentColor"
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="m12 18-7 3 7-18 7 18-7-3Zm0 0v-5"
          />
        </svg>
      </button>
    </div>
  );
}

export default SendPanel;
