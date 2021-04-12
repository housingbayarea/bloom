import {
  createContext,
  createElement,
  useReducer,
  FunctionComponent,
  useEffect,
  useContext,
} from "react"
import { createAction, createReducer } from "typesafe-actions"
import { clearToken, getToken, getTokenTtl, setToken } from "./token"
import {
  confirmAccount,
  createAxiosInstance,
  forgotPassword,
  getProfile,
  login,
  register,
  resendConfirmation,
  scheduleTokenRefresh,
  updatePassword,
} from "./api_requests"
import { ConfigContext } from "../config/ConfigContext"
import { User, UserCreate } from "@bloom-housing/backend-core/types"
// External interface this context provides
type ContextProps = {
  confirmAccount: (token: string) => Promise<User>
  forgotPassword: (email: string) => Promise<string>
  login: (email: string, password: string) => Promise<User>
  createUser: (user: UserCreate) => Promise<string>
  resendConfirmation: (email: string) => Promise<string>
  signOut: () => void
  // True when an API request is processing
  updatePassword: (token: string, password: string, passwordConfirmation: string) => Promise<User>
  loading: boolean
  profile?: User
  accessToken?: string
  initialStateLoaded: boolean
}

// Internal Provider State
type UserState = {
  loading: boolean
  initialStateLoaded: boolean
  storageType: string
  accessToken?: string
  profile?: User
  refreshTimer?: number
}

type DispatchType = (...arg: [unknown]) => void

// State Mutation Actions
const saveToken = createAction("SAVE_TOKEN")<{
  apiUrl: string
  accessToken: string
  dispatch: DispatchType
}>()
const startLoading = createAction("START_LOADING")()
const stopLoading = createAction("STOP_LOADING")()
const saveProfile = createAction("SAVE_PROFILE")<User>()
const signOut = createAction("SIGN_OUT")()

const reducer = createReducer(
  { loading: false, initialStateLoaded: false, storageType: "session" } as UserState,
  {
    SAVE_TOKEN: (state, { payload }) => {
      const { refreshTimer: oldRefresh, ...rest } = state
      const { accessToken, apiUrl, dispatch } = payload

      // If an existing refresh timer has been defined, remove it as the access token has changed
      if (oldRefresh) {
        clearTimeout(oldRefresh)
      }

      // Save off the token in local storage for persistence across reloads.
      setToken(state.storageType, accessToken)

      const refreshTimer = scheduleTokenRefresh(apiUrl, accessToken, (newAccessToken) =>
        dispatch(saveToken({ apiUrl, accessToken: newAccessToken, dispatch }))
      )

      return {
        ...rest,
        ...(refreshTimer && { refreshTimer }),
        accessToken: accessToken,
      }
    },
    START_LOADING: (state) => ({ ...state, loading: true }),
    END_LOADING: (state) => ({ ...state, loading: false }),
    SAVE_PROFILE: (state, { payload: user }) => ({ ...state, profile: user }),
    SIGN_OUT: ({ storageType }) => {
      clearToken(storageType)
      // Clear out all existing state other than the storage type
      return { loading: false, storageType, initialStateLoaded: true }
    },
  }
)

export const UserContext = createContext<Partial<ContextProps>>({})

export const UserProvider: FunctionComponent = ({ children }) => {
  const { apiUrl, storageType } = useContext(ConfigContext)
  const [state, dispatch] = useReducer(reducer, {
    loading: false,
    initialStateLoaded: false,
    storageType,
  })

  // Load our profile as soon as we have an access token available
  useEffect(() => {
    if (!state.profile && state.accessToken) {
      const client = createAxiosInstance(apiUrl, state.accessToken)
      const loadProfile = async () => {
        dispatch(startLoading())
        try {
          const profile = await getProfile(client)
          dispatch(saveProfile(profile))
        } catch (err) {
          dispatch(signOut())
        } finally {
          dispatch(stopLoading())
        }
      }
      void loadProfile()
    }
  }, [state.profile, state.accessToken, apiUrl])

  // On initial load/reload, check localStorage to see if we have a token available
  useEffect(() => {
    const accessToken = getToken(storageType)
    if (accessToken) {
      const ttl = getTokenTtl(accessToken)

      if (ttl > 0) {
        dispatch(saveToken({ accessToken, apiUrl, dispatch }))
      } else {
        dispatch(signOut())
      }
    } else {
      dispatch(signOut())
    }
  }, [apiUrl, storageType])

  const contextValues: ContextProps = {
    loading: state.loading,
    profile: state.profile,
    accessToken: state.accessToken,
    initialStateLoaded: state.initialStateLoaded,
    login: async (email, password) => {
      dispatch(signOut())
      dispatch(startLoading())
      try {
        const accessToken = await login(apiUrl, email, password)
        dispatch(saveToken({ accessToken, apiUrl, dispatch }))
        const client = createAxiosInstance(apiUrl, accessToken)
        const profile = await getProfile(client)
        dispatch(saveProfile(profile))
        return profile
      } finally {
        dispatch(stopLoading())
      }
    },
    createUser: async (user: UserCreate) => {
      dispatch(startLoading())
      try {
        const { status: status } = await register(apiUrl, user)
        return status
      } finally {
        dispatch(stopLoading())
      }
    },
    resendConfirmation: async (email: string) => {
      dispatch(startLoading())
      try {
        const { status: status } = await resendConfirmation(apiUrl, email)
        return status
      } finally {
        dispatch(stopLoading())
      }
    },
    signOut: () => dispatch(signOut()),
    forgotPassword: async (email) => {
      dispatch(startLoading())
      try {
        const message = await forgotPassword(apiUrl, email)
        return message
      } finally {
        dispatch(stopLoading())
      }
    },
    updatePassword: async (token, password, passwordConfirmation) => {
      dispatch(startLoading())
      try {
        const accessToken = await updatePassword(apiUrl, token, password, passwordConfirmation)
        dispatch(saveToken({ accessToken, apiUrl, dispatch }))
        const client = createAxiosInstance(apiUrl, accessToken)
        const profile = await getProfile(client)
        dispatch(saveProfile(profile))
        return profile
      } finally {
        dispatch(stopLoading())
      }
    },
    confirmAccount: async (token) => {
      dispatch(startLoading())
      try {
        const accessToken = await confirmAccount(apiUrl, token)
        dispatch(saveToken({ accessToken, apiUrl, dispatch }))
        const client = createAxiosInstance(apiUrl, accessToken)
        const profile = await getProfile(client)
        dispatch(saveProfile(profile))
        return profile
      } finally {
        dispatch(stopLoading())
      }
    },
  }
  return createElement(UserContext.Provider, { value: contextValues }, children)
}

export default UserContext
